chrome.storage.local.get(['timeTrackingData'], (result) => {
  const data = result.timeTrackingData || {};
  const currentDate = getCurrentDate();
  const dailyData = data[currentDate] || {};
  const labels = Object.keys(dailyData);
  
  const timeSpent = labels.map(domain => (dailyData[domain].totalTime / (1000 * 60)).toFixed(1)); 
  
  const ctx = document.getElementById('timeChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Time Spent (minutes)',
        data: timeSpent,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    }
  });

  // Display total time of each website
  const summaryDiv = document.getElementById('daily-summary');
  summaryDiv.innerHTML = '<h2>Daily Usage Summary</h2>';
  labels.forEach(domain => {
    const minutes = (dailyData[domain].totalTime / (1000 * 60)).toFixed(2);
    summaryDiv.innerHTML += `<p>${domain}: ${minutes} minutes</p>`;
  });
});

function getCurrentDate() {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
  return date;
}
