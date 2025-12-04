// api/weather.js (서버리스 함수)

// Vercel 환경 변수에서 키를 안전하게 불러옵니다.
const API_KEY = process.env.WEATHER_API_KEY; 
const API_BASE_URL = 'https://api.openweathermap.org';

// 이 함수가 클라이언트의 요청을 처리합니다.
export default async function (req, res) {
  // 요청에서 필요한 정보 (예: 도시 이름)를 가져올 수 있지만, 
  // 여기서는 간단하게 'Seoul'을 예로 듭니다.
  const city = 'Seoul'; 
  
  if (!API_KEY) {
    // 키가 설정되지 않았을 경우 오류를 반환합니다.
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {
    // 1. 서버에서 외부 OpenWeatherMap API를 호출합니다.
    const apiUrl = `${API_BASE_URL}/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`External API failed with status ${response.status}`);
    }

    const data = await response.json();

    // 2. 서버가 받은 데이터를 클라이언트(브라우저)에게 전달합니다.
    // (API 키는 전달되지 않습니다.)
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
