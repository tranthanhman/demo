"use client";

import React, { useState, useRef, useCallback } from "react";
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

const FRAMES = [
  {
    id: "simple",
    url: "/frame-1.png",
    name: "Khung Đơn Giản",
  },
  {
    id: "vintage",
    url: "/frame-2.png",
    name: "Khung Cổ Điển",
  },
  {
    id: "modern",
    url: "/frame-3.png",
    name: "Khung Hiện Đại",
  },
  {
    id: "colorful",
    url: "/frame-1.png",
    name: "Khung Màu Sắc",
  },
];

export default function ImageFrameGenerator() {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#000000");
  const [fileType, setFileType] = useState("png");
  const [currentFrame, setCurrentFrame] = useState(FRAMES[0]);
  const frameRef = useRef(null);

  const handleExport = useCallback(() => {
    if (!frameRef.current) return;

    const canvas = document.createElement("canvas");
    const frameElement = frameRef.current;

    canvas.width = frameElement.offsetWidth;
    canvas.height = frameElement.offsetHeight;

    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const x = canvas.width / 2;
      const y = canvas.height / 2;

      const words = text.split(" ");
      const lineHeight = fontSize * 1.2;
      let line = "";
      let yOffset = y - lineHeight * (words.length / 2);

      words.forEach((word) => {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);

        if (metrics.width > canvas.width * 0.9 && line !== "") {
          ctx.fillText(line, x, yOffset);
          line = word + " ";
          yOffset += lineHeight;
        } else {
          line = testLine;
        }
      });

      if (line) {
        ctx.fillText(line, x, yOffset);
      }

      const dataUrl = canvas.toDataURL(`image/${fileType}`);
      const link = document.createElement("a");
      link.download = `exported-image.${fileType}`;
      link.href = dataUrl;
      link.click();
    };

    img.src = currentFrame.url;
  }, [text, fontSize, fontColor, fileType, currentFrame]);

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Image Frame Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={frameRef}
            className="relative w-full h-[400px] mb-4 flex items-center justify-center"
            style={{
              backgroundImage: `url(${currentFrame.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span
              style={{
                fontSize: `${fontSize}px`,
                color: fontColor,
              }}
              className="absolute text-center p-2 max-w-full break-words"
            >
              {text}
            </span>
          </div>

          <div className="space-y-3">
            <Select
              value={currentFrame.id}
              onValueChange={(value) => {
                const frame = FRAMES.find((f) => f.id === value);
                setCurrentFrame(frame);
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
              />

              <Select value={fileType} onValueChange={setFileType}>
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
