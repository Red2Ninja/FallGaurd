import torch

class Model:
    def __init__(self, model_path="fallguard/models/yolov7-w6-pose.pt"):
        self.model = torch.load(model_path)  # or torch.hub.load depending on your setup

    def predict(self, input_data):
        # implement prediction logic
        return self.model(input_data)
