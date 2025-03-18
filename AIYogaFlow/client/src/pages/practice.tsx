import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { initializePoseDetection, detectPose } from "@/lib/pose-detection";
import { analyzePose, generateFeedback } from "@/lib/pose-correction";
import { apiRequest } from "@/lib/queryClient";

export default function Practice() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await initializePoseDetection();
        }
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive",
        });
      }
    }

    setupCamera();
  }, []);

  async function startDetection() {
    if (!videoRef.current || !canvasRef.current) return;

    setIsDetecting(true);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let startTime = Date.now();
    let frameId: number;

    async function detect() {
      if (!videoRef.current || !ctx) return;

      try {
        const poses = await detectPose(videoRef.current);

        // Clear the canvas before drawing
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        if (poses && poses.length > 0) {
          // Analyze the pose and get feedback
          const poseCorrection = analyzePose(poses[0], "Mountain Pose");
          const detailedFeedback = generateFeedback(poseCorrection);

          // Update score and feedback
          setScore(poseCorrection.score);
          setFeedback(detailedFeedback);

          // Draw pose keypoints and connections
          const keypoints = poses[0].keypoints;

          // Draw keypoints
          keypoints.forEach((keypoint) => {
            if (keypoint.score && keypoint.score > 0.3) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "#00ff00";
              ctx.fill();
            }
          });
        }

        // Update duration
        setDuration(Math.floor((Date.now() - startTime) / 1000));

        if (isDetecting) {
          frameId = requestAnimationFrame(detect);
        }
      } catch (error) {
        console.error("Pose detection error:", error);
      }
    }

    detect();

    return () => {
      cancelAnimationFrame(frameId);
      setIsDetecting(false);
    };
  }

  async function endSession() {
    setIsDetecting(false);

    try {
      await apiRequest("POST", "/api/sessions", {
        userId: 1, // TODO: Get from auth context
        duration,
        score,
      });

      toast({
        title: "Session Complete",
        description: `Great job! You scored ${score} points in ${duration} seconds.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save session.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-4 mb-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={640}
              height={480}
            />
          </div>
        </Card>

        <div className="grid gap-4 mb-4">
          {feedback.map((message, index) => (
            <Alert key={index}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span>Form Score</span>
            <Progress value={score} className="w-64" />
          </div>

          <div className="flex justify-between items-center">
            <span>Duration</span>
            <span>{duration}s</span>
          </div>

          <div className="flex gap-4">
            {!isDetecting ? (
              <Button onClick={startDetection} className="flex-1">
                Start Practice
              </Button>
            ) : (
              <Button onClick={endSession} variant="destructive" className="flex-1">
                End Session
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}