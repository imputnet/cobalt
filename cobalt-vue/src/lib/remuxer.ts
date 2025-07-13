let ffmpeg: any;

export async function remux(videoBlob: Blob, audioBlob: Blob, onProgress?: (p: number) => void): Promise<Blob> {
  if (!ffmpeg) {
    // 动态导入，类型断言绕过 TS 检查
    const ffmpegModule = await import('@ffmpeg/ffmpeg') as any;
    ffmpeg = ffmpegModule.createFFmpeg({ log: true });
    await ffmpeg.load();
  }

  ffmpeg.FS('writeFile', 'video.m4s', await ffmpeg.fetchFile(videoBlob));
  ffmpeg.FS('writeFile', 'audio.m4s', await ffmpeg.fetchFile(audioBlob));

  await ffmpeg.run(
    '-i', 'video.m4s',
    '-i', 'audio.m4s',
    '-c', 'copy',
    '-f', 'mp4',
    'output.mp4'
  );

  const data = ffmpeg.FS('readFile', 'output.mp4');
  // 清理
  ffmpeg.FS('unlink', 'video.m4s');
  ffmpeg.FS('unlink', 'audio.m4s');
  ffmpeg.FS('unlink', 'output.mp4');

  return new Blob([data.buffer], { type: 'video/mp4' });
} 