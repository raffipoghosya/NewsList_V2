const token = "ExponentPushToken[sD3FXyBt1snrd3rZvMeLDy]"; // Օրինակ՝ ExponentPushToken[abc...]




const sendTestNotification = async () => {
  const message = 'Տեսնել նորությունը';

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title: 'NewsList',
      body: message,
    }),
  });

  const data = await res.json();
  console.log('📨 Feedback from Expo:', data);
};

sendTestNotification();
