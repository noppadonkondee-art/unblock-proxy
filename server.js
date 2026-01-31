const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// ตั้งค่าปลอมตัวเป็น Chrome บนคอมพิวเตอร์
const FAKE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Connection': 'keep-alive'
};

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    
    // ถ้าไม่มีลิงก์มา ให้แจ้งเตือน
    if (!targetUrl) return res.status(400).send('No URL provided');

    try {
        console.log(`กำลังเชื่อมต่อ: ${targetUrl}`);

        // สั่งให้ Server ไปโหลดข้อมูลแทนเรา
        const response = await axios({
            method: 'get',
            url: targetUrl,
            responseType: 'stream', // โหลดแบบ Stream (ไหลมาเทมา)
            headers: FAKE_HEADERS,
            validateStatus: false // รับทุกสถานะ ไม่ให้ Error ง่ายๆ
        });

        // ก๊อปปี้ข้อมูลสำคัญส่งต่อให้คนดู
        const keys = ['content-type', 'content-length', 'accept-ranges'];
        keys.forEach(k => {
            if (response.headers[k]) res.setHeader(k, response.headers[k]);
        });

        // ส่งข้อมูลวิดีโอออกไป
        response.data.pipe(res);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).end();
    }
});

// เปิด Port รอรับการเชื่อมต่อ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
