# fallguard/detector.py

import cv2
import torch
import math
import numpy as np
from torchvision import transforms

from yolov7.utils.general import non_max_suppression_kpt
from yolov7.utils.plots import output_to_keypoint, plot_skeleton_kpts
from yolov7.utils.datasets import letterbox

import torch.serialization
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "yolov7"))



from fallguard.models.yolo import Model


from fallguard.report import describe_fall_frames
from fallguard.alert import send_fall_alert_email

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "yolov7"))




# Allow YOLO Model class in pickle
torch.serialization.add_safe_globals([Model])


# Load YOLO Pose Model

def get_pose_model():
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    weights = torch.load("fallguard/models/yolov7-w6-pose.pt", map_location=device, weights_only=False)
    model = weights["model"]
    model = model.float().eval()
    if torch.cuda.is_available():
        model = model.half().to(device)
    return model, device



# Fall Detection Function

def extract_bbox(pose):
    """
    Extracts bounding box from YOLOv7 pose output.
    Supports both (x_center, y_center, w, h) and (xmin, ymin, xmax, ymax).
    """
    # Grab values
    a, b, c, d = pose[2:6]

    # Heuristic: if c and d look like width/height (not huge), treat as center format
    if c < 2000 and d < 2000:
        x_center, y_center, w, h = a, b, c, d
        xmin = x_center - w / 2
        ymin = y_center - h / 2
        xmax = x_center + w / 2
        ymax = y_center + h / 2
    else:
        # Already in (xmin, ymin, xmax, ymax)
        xmin, ymin, xmax, ymax = a, b, c, d

    return xmin, ymin, xmax, ymax


def fall_detection(poses):
    """
    Analyzes detected poses and returns (True, bbox) if a fall is detected.
    Otherwise, returns (False, None).
    """
    for pose in poses:
        xmin, ymin, xmax, ymax = extract_bbox(pose)

        # Shoulder and body points
        left_shoulder_y, left_shoulder_x = pose[23], pose[22]
        right_shoulder_y = pose[26]
        left_body_y, left_body_x = pose[41], pose[40]
        right_body_y = pose[44]

        # Distance factor (shoulder ↔ body)
        len_factor = math.sqrt(
            (left_shoulder_y - left_body_y) ** 2 + (left_shoulder_x - left_body_x) ** 2
        )

        # Feet
        left_foot_y, right_foot_y = pose[53], pose[56]

        # Aspect ratio check
        dx, dy = int(xmax) - int(xmin), int(ymax) - int(ymin)
        difference = dy - dx

        # Fall detection conditions
        if (
            (left_shoulder_y > left_foot_y - len_factor
             and left_body_y > left_foot_y - (len_factor / 2)
             and left_shoulder_y > left_body_y - (len_factor / 2))
            or
            (right_shoulder_y > right_foot_y - len_factor
             and right_body_y > right_foot_y - (len_factor / 2)
             and right_shoulder_y > right_body_y - (len_factor / 2))
            or
            difference < 0
        ):
            return True, (xmin, ymin, xmax, ymax)

    return False, None




# Process Video Function

def process_video(video_path, to_emails):
    model, device = get_pose_model()
    vid_cap = cv2.VideoCapture(video_path)
    if not vid_cap.isOpened():
        raise Exception("Video not found: " + video_path)

    width = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    output_video = os.path.join("uploads", "processed.mp4")
    vid_out = cv2.VideoWriter(output_video, cv2.VideoWriter_fourcc(*'mp4v'), 30, (width, height))

    fall_frames = []
    frame_id = 0
    success, frame = vid_cap.read()

    while success:
        frame_id += 1

        if frame_id % 10 != 0:
            vid_out.write(frame)  # still write original frame to keep smooth video
            success, frame = vid_cap.read()
            continue

        image = letterbox(frame, 960, stride=64, auto=True)[0]
        image = transforms.ToTensor()(image).unsqueeze(0)
        if torch.cuda.is_available():
            image = image.half().to(device)

        with torch.no_grad():
            output, _ = model(image)
            output = non_max_suppression_kpt(output, 0.25, 0.65,
                                             nc=model.yaml['nc'], nkpt=model.yaml['nkpt'], kpt_label=True)
            output = output_to_keypoint(output)
                # Debug: print pose structure once
            if frame_id == 1 and len(output) > 0:
                print("Pose output sample:", output[0])


        is_fall, bbox = fall_detection(output)
        if is_fall:
            x_min, y_min, x_max, y_max = bbox
            cv2.rectangle(frame, (int(x_min), int(y_min)), (int(x_max), int(y_max)), (0,0,255), 3)
            cv2.putText(frame, "Fall Detected", (50,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

            snapshot_file = os.path.join("uploads", f"fall_snapshot_{frame_id}.jpg")
            cv2.imwrite(snapshot_file, frame)

            fall_frames.append({
                "frame_id": frame_id,
                "bbox": bbox,
                "snapshot_path": snapshot_file,
                "pose": output
            })

        vid_out.write(frame)
        success, frame = vid_cap.read()

    vid_out.release()
    vid_cap.release()

    if fall_frames:
        middle_index = len(fall_frames) // 2

        # Save AI report to file
        
        report_file = describe_fall_frames([fall_frames[middle_index]])

        with open(report_file, "r") as f:
            report_text = f.read()


        send_fall_alert_email(to_emails, report_file, fall_frames[middle_index]["snapshot_path"])

        return output_video, report_file, fall_frames[middle_index]["snapshot_path"]

    return None, None, None
