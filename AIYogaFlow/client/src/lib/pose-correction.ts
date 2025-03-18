import { Pose } from '@tensorflow-models/pose-detection';

interface JointAngle {
  angle: number;
  joints: string[];
  idealAngle: number;
  tolerance: number;
}

interface PoseCorrection {
  score: number;
  feedback: string[];
  angles: JointAngle[];
}

const POSE_KEYPOINTS = {
  NOSE: 0,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

// Calculate angle between three points
function calculateAngle(a: number[], b: number[], c: number[]): number {
  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

// Compare detected pose with ideal pose
export function analyzePose(detectedPose: Pose, poseName: string): PoseCorrection {
  const feedback: string[] = [];
  let score = 0;
  const angles: JointAngle[] = [];

  if (!detectedPose.keypoints || detectedPose.keypoints.length === 0) {
    return { score: 0, feedback: ["No pose detected"], angles: [] };
  }

  const keypoints = detectedPose.keypoints;

  // Example for analyzing "Mountain Pose" (Tadasana)
  if (poseName === "Mountain Pose") {
    // Check shoulder alignment
    const leftShoulder = keypoints[POSE_KEYPOINTS.LEFT_SHOULDER];
    const rightShoulder = keypoints[POSE_KEYPOINTS.RIGHT_SHOULDER];
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);

    if (shoulderDiff > 0.1) {
      feedback.push("Keep your shoulders level");
    } else {
      score += 20;
    }

    // Check hip alignment
    const leftHip = keypoints[POSE_KEYPOINTS.LEFT_HIP];
    const rightHip = keypoints[POSE_KEYPOINTS.RIGHT_HIP];
    const hipDiff = Math.abs(leftHip.y - rightHip.y);

    if (hipDiff > 0.1) {
      feedback.push("Keep your hips level");
    } else {
      score += 20;
    }

    // Check spine alignment
    const nose = keypoints[POSE_KEYPOINTS.NOSE];
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
    const spineAngle = calculateAngle(
      [nose.x, nose.y],
      [midHip.x, midHip.y],
      [midHip.x, midHip.y + 1]
    );

    angles.push({
      angle: spineAngle,
      joints: ["spine"],
      idealAngle: 180,
      tolerance: 10,
    });

    if (Math.abs(180 - spineAngle) > 10) {
      feedback.push("Straighten your spine");
    } else {
      score += 30;
    }

    // Check ankle position
    const leftAnkle = keypoints[POSE_KEYPOINTS.LEFT_ANKLE];
    const rightAnkle = keypoints[POSE_KEYPOINTS.RIGHT_ANKLE];
    const ankleDiff = Math.abs(leftAnkle.x - rightAnkle.x);

    if (ankleDiff > 0.1) {
      feedback.push("Keep your feet together");
    } else {
      score += 30;
    }
  }

  // Add more pose analyses here for other yoga poses

  if (feedback.length === 0) {
    feedback.push("Excellent form! Keep it up!");
  }

  return {
    score,
    feedback,
    angles,
  };
}

// Generate detailed feedback based on pose analysis
export function generateFeedback(correction: PoseCorrection): string[] {
  const { score, feedback, angles } = correction;
  const detailedFeedback = [...feedback];

  if (score < 50) {
    detailedFeedback.push("Focus on maintaining proper alignment");
  } else if (score < 80) {
    detailedFeedback.push("Good progress! Small adjustments needed");
  } else {
    detailedFeedback.push("Excellent form! You're mastering this pose");
  }

  angles.forEach(({ angle, joints, idealAngle, tolerance }) => {
    const diff = Math.abs(idealAngle - angle);
    if (diff > tolerance) {
      detailedFeedback.push(
        `Adjust ${joints.join("-")} angle from ${Math.round(angle)}° to ${idealAngle}°`
      );
    }
  });

  return detailedFeedback;
}
