# 语音转录指南（蜂工必读）v2

## 当你收到语音消息时

### 方法1（首选）：本地Whisper — 零延迟，不限流
```bash
# 转wav
ffmpeg -i /path/to/voice.ogg -ar 16000 -ac 1 -f wav /tmp/voice_out.wav -y

# 本地转录（base模型，146ms极速）
whisper-cli -m /opt/homebrew/share/whisper-cpp/models/ggml-base.bin -l zh -f /tmp/voice_out.wav --no-timestamps 2>/dev/null
```
注意：输出可能是繁体中文，内容准确即可。

### 方法2（备选）：Gemini API — 简体中文，可能限流
```bash
ffmpeg -i /path/to/voice.ogg -ar 16000 -ac 1 -f wav /tmp/voice_out.wav -y
```
```python
python3 -c "
import base64, json, urllib.request, os
with open('/tmp/voice_out.wav', 'rb') as f:
    wav_b64 = base64.b64encode(f.read()).decode()
payload = json.dumps({'contents': [{'parts': [
    {'inline_data': {'mime_type': 'audio/wav', 'data': wav_b64}},
    {'text': '请准确转录这段中文语音，只输出转录文字。'}
]}]}).encode()
# 优先2.5-flash，2.0-flash容易429
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={os.environ[\"GEMINI_API_KEY\"]}'
req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
r = json.loads(resp.read())
print(r['candidates'][0]['content']['parts'][0]['text'])
"
```

### 策略
1. 首选本地Whisper（快、免费、不限流）
2. 如果本地模型不可用，用Gemini 2.5 Flash
3. 如果2.5也429，用Gemini 2.0 Flash
