import * as poseDetection from '@tensorflow-models/pose-detection';

let detector: poseDetection.PoseDetector | null = null;

export async function initializePoseDetection() {
  if (detector) return;
  
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
  };
  
  detector = await poseDetection.createDetector(model, detectorConfig);
}

export async function detectPose(video: HTMLVideoElement) {
  if (!detector) {
    throw new Error('Pose detector not initialized');
  }

  const poses = await detector.estimatePoses(video, {
    flipHorizontal: false
  });

  return poses;
}

export function drawPose(ctx: CanvasRenderingContext2D, poses: poseDetection.Pose[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  poses.forEach((pose) => {
    if (pose.keypoints) {
      // Draw points
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score && keypoint.score > 0.3) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = 'aqua';
          ctx.fill();
        }
      });

      // Draw connections
      const connections = poseDetection.util.getAdjacentPairs(model);
      connections.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];

        if (kp1.score && kp2.score && kp1.score > 0.3 && kp2.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.strokeStyle = 'aqua';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  });
}
