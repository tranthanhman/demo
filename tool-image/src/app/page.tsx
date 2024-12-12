"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Frame = {
  id: string;
  url: string;
  name: string;
};

type FileType = "png" | "jpeg";

const FRAMES: Frame[] = [
  {
    id: "simple",
    url: "/frame-1.png",
    name: "Khung Đơn Giản",
  },
  {
    id: "vintage",
    url: "/frame-2.png",
    name: "Khung Cổ Điển",
  }
];

export default function ImageFrameGenerator() {
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontColor, setFontColor] = useState<string>("#000000");
  const [fileType, setFileType] = useState<FileType>("png");
  const [currentFrame, setCurrentFrame] = useState<Frame>(FRAMES[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");

  const [textPosition, setTextPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameImageRef = useRef<HTMLImageElement | null>(null);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const frameImage = frameImageRef.current;

    if (!canvas || !ctx || !frameImage) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // First draw text
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, textPosition.x, textPosition.y);

    // Then draw frame image on top
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }, [text, fontSize, fontColor, textPosition, backgroundColor]);

  useEffect(() => {
    // Khởi tạo image ở client side
    const img = new Image();
    frameImageRef.current = img;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        // Reset text position to center
        setTextPosition({
          x: img.width / 2 - (text.length * fontSize) / 4,
          y: img.height / 2 - fontSize / 2,
        });
        redrawCanvas();
      }
    };
    img.src = currentFrame.url;

    return () => {
      img.onload = null;
    };
  }, [currentFrame, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [text, fontSize, fontColor, textPosition, backgroundColor, redrawCanvas]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL(`image/${fileType}`);
    const link = document.createElement("a");
    link.download = `exported-image.${fileType}`;
    link.href = dataUrl;
    link.click();
  }, [fileType]);

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Image Frame Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref={canvasRef} className="w-full mb-4" />

          <div className="space-y-3">
            <Select
              value={currentFrame.id}
              onValueChange={(value: string) => {
                const frame = FRAMES.find((f) => f.id === value);
                if (frame) setCurrentFrame(frame);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn Khung Hình" />
              </SelectTrigger>
              <SelectContent>
                {FRAMES.map((frame) => (
                  <SelectItem key={frame.id} value={frame.id}>
                    {frame.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Nhập văn bản"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Cỡ chữ"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24"
              />

              <Input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-24"
                title="Màu chữ"
              />

              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-24"
                title="Màu nền"
              />

              <Select
                value={fileType}
                onValueChange={(value: FileType) => setFileType(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Định dạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="w-full" disabled={!text}>
              Xuất Ảnh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
