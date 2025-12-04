// api/weather.js (날씨 및 검색 통합 서버리스 함수)

// Vercel 환경 변수에서 API 키를 안전하게 불러옵니다.
const API_KEY = process.env.WEATHER_API_KEY; 
const API_BASE_URL = 'https://api.openweathermap.org';

export default async function (req, res) {
  // 클라이언트 요청에서 쿼리 파라미터 (q, lat, lon)를 추출합니다.
  const { q, lat, lon } = req.query; 

  if (!API_KEY) {
    // Vercel 환경 변수 설정 누락 시 500 에러 반환
    return res.status(500).json({ error: 'API Key not configured in Vercel. Please set WEATHER_API_KEY.' });
  }

  try {
    let apiUrl = '';
    let data;

    // 1. 도시 검색 요청 처리 (q 파라미터가 있을 때)
    if (q) {
      // OpenWeatherMap Geo API 호출
      apiUrl = `${API_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${API_KEY}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
          throw new Error(`External Geo API failed with status ${response.status}`);
      }
      data = await response.json();
      
    } 
    
    // 2. 날씨 및 예보 요청 처리 (lat, lon 파라미터가 있을 때)
    else if (lat && lon) {
      // 날씨와 예보 데이터를 동시에 가져오기 위해 Promise.all 사용
      const [currentResponse, forecastResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
          fetch(`${API_BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
           throw new Error(`External Weather API failed with status ${currentResponse.status} or ${forecastResponse.status}`);
      }

      const current = await currentResponse.json();
      const forecast = await forecastResponse.json();
      
      // 클라이언트에게 { current, forecast: list } 형태로 반환
      data = { current, forecast: forecast.list };
    } 
    
    // 3. 필요한 쿼리 파라미터가 없는 경우
    else {
        return res.status(400).json({ error: 'Missing required query parameters (q or lat/lon).' });
    }

    // 결과 데이터를 클라이언트에게 전달합니다.
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}
