<template>
  <div class="ocr-uploader">
    <h2>OCR 上傳器</h2>
    <input type="file" @change="handleFileUpload" />

    <div v-for="(img, index) in previews" :key="index" style="margin-top: 10px;">
      <img :src="img" alt="preview" style="max-width: 300px;" />
    </div>

    <textarea
      v-model="userDescription"
      placeholder="如有特別要求請說明"
      rows="4"
      style="width: 100%; margin-top: 20px;"
    ></textarea>

    <button @click="submit">送出並分析</button>

    <div v-if="resultJson" class="result-box">{{ resultJson }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const files = ref([])
const previews = ref([])
const userDescription = ref('')
const resultJson = ref('')

function handleFileUpload(event) {
  files.value = [event.target.files[0]]
  previews.value = files.value.map(file => URL.createObjectURL(file))
}

async function submit() {
  if (files.value.length === 0) {
    alert('請先上傳圖片')
    return
  }

  const file = files.value[0]
  const base64 = await fileToBase64(file)

  const prompt = `
  這是一張用來協助除錯的螢幕截圖，請從圖片內容中盡可能解析出重要參數，
  並整理成 JSON 格式，像這樣：

  {
    "job_id": "123",
    "error_message": "invalid token"
  }

  使用者說明：「${userDescription.value || '（無）'}」
  請只回傳 JSON，不要加註解或多餘的說明。
  `

  try {
    const response = await axios.post('https://ocr-proxy-server-nc2l.onrender.com/api/gpt-analyze', {
      prompt,
      base64Image: base64,
    })

    const content = response.data.choices?.[0]?.message?.content?.trim()
    resultJson.value = content || '[無結果]'
  } catch (err) {
    console.error(err)
    resultJson.value = '[發生錯誤]'
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>
