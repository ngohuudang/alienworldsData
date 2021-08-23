let now=new Date();
let nowDate=now.getFullYear()+'-'+'0'+(now.getMonth()+1)+'-'+now.getDate();
console.log(nowDate);
console.log(typeof(nowDate));
document.querySelector(".date-input").setAttribute("value", nowDate);
// khoi tao mạc dinh các object date và time
let date = {
  day: 0,
  month: 0,
  year: 0,
};
let time = {
  hour: 0,
  minute: 0,
  second: 0,
};
// check có cùng ngày không
function checkDate(sessions, session) {
  console.log(sessions.length);
  for (let i = 0; i < sessions.length; i++) {
    if (
      sessions[i].date.day == session.date.day &&
      sessions[i].date.month == session.date.month &&
      sessions[i].date.year == session.date.year
    ) {
      return i;
    }
  }
  return -1;
}

// check có giờ không
function checkHour(sessions, session) {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].time.hour == session.time.hour) {
      if (
        sessions[i].date.day == session.date.day &&
        sessions[i].date.month == session.date.month &&
        sessions[i].date.year == session.date.year
      ) {
        return i;
      }
    }
  }
  return -1;
}
// dùng fetch để get data
async function getData(apiURL) {
  const response = await fetch(apiURL);
  const data = await response.json();
  return data;
}
// dung axios để get data
async function getJSONAsync(apiURL) {
  // The await keyword saves us from having to write a .then() block.
  try {
    let json = await axios.get(apiURL);
    // The result of the GET request is available in the json variable.
    // We return it just like in a regular synchronous function.
    return json;
  } catch (error) {
    return;
  }
}

async function getAccountData(account, date) {
  // list web để get API
  let URLGetData = [
    "https://wax.eosphere.io",
    "https://wax.cryptolions.io",
    "https://wax.eu.eosamsterdam.net",
    "https://api.wax.alohaeos.com",
    "https://wax.eu.eosamsterdam.net",
    "https://api.waxsweden.org",
  ];
  for (url of URLGetData) {
    let apiURL =
      url +
      "/v2/history/get_actions?account=" +
      account +
      "&skip=0&limit=300&sort=desc&transfer.to=" +
      account +
      "&transfer.from=m.federation&after=" +
      date +
      "T00:00:00.000Z&before=" +
      date +
      "T23:59:59.999Z";
    let response = await getJSONAsync(apiURL);
    if (response) return response.data;
  }
}

function drawChart() {
  let totalCoin = 0.0; //tổng coin đào được
  let sessions = []; //dùng để chứa lượng coin đào được qua các giờ từ 0-->23
  let count = 0; //tổng lượt đào
  let account = document.querySelector(".account").value;
  console.log(account);
  if (account === "") return;
  let input = document.querySelector(".date-input").value;
  let dateEntered = new Date(input);
  document.querySelector(".date-input").setAttribute("value", input);
  let today = dateEntered.getDate();

  getAccountData(account, input).then((data) => {
    for (let i = 0; i < data.actions.length; i++) {
      let session = {
        date: {
          day: 0,
          month: 0,
          year: 0,
        },
        time: {
          hour: 0,
          minute: 0,
          second: 0,
        },
        amount: 0,
      };
      let str = data.actions[i].timestamp.split("T");
      let property_date = str[0].split("-");
      let property_time = str[1].split(":");
      if (str[0] == input) {
        count++;
      }
      session.date = {
        day: property_date[2],
        month: property_date[1],
        year: property_date[0],
      };
      session.time = {
        hour: property_time[0],
        minute: property_time[1],
        second: property_time[2],
      };
      let index = checkHour(sessions, session);
      if (index !== -1) {
        // nếu cùng giờ thì cộng thêm vào amount
        if (property_time[0] === sessions[index].time.hour) {
          sessions[index].amount += data.actions[i].act.data.amount;
        }
        // nếu khác thì cập nhật session mới
        else {
          session.amount = data.actions[i].act.data.amount;
          sessions.push(session);
        }
      } else {
        session.amount = data.actions[i].act.data.amount;
        sessions.push(session);
      }
    }
    let amountArray = [];// tao 1 mảng mới để lưu lượng coin đào được qua từng giờ
    const sessionsLeght = sessions.length;
    for (let i = sessionsLeght - 1; i >= 0; i--) {
      // console.log(sessions[i]);
      if (sessions[i].date.day == today) {
        for (let j = amountArray.length; j < sessions[i].time.hour; j++) {
          amountArray.push(0);
        }
        amountArray.push(sessions[i].amount);
        totalCoin += sessions[i].amount;
      }
    }
    for (let i = amountArray.length; i < 24; i++) {
      amountArray.push(0);
    }
    let valueTotalTLM = document
      .querySelector(".card-view__item.tlm")
      .querySelector(".value");
    valueTotalTLM.innerHTML = totalCoin.toFixed(4);
    let valueTotalUSD = document
      .querySelector(".card-view__item.usd")
      .querySelector(".value");
    valueTotalUSD.innerHTML = "$" + (totalCoin * 0.295).toFixed(2);
    let valueCount = document
      .querySelector(".card-view__item.count")
      .querySelector(".value");
    valueCount.innerHTML = count;
    // delete current chart
    myBarChart.destroy();
    // create new chart
    myBarChart = new Chart("myChart", {
      type: "bar",
      data: {
        labels: hourArray,
        datasets: [
          {
            backgroundColor: "#49d994",
            data: amountArray,
          },
        ],
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: "TLM Earned" + " " + input,
        },
      },
    });

    // }
  });
}

// khởi tạo mặc định giờ giờ và coin
let hourArray = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
];
let amountArray = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
// tạo mặc định 1 bar chart
let myBarChart = new Chart("myChart", {
  type: "bar",
  data: {
    labels: hourArray,
    datasets: [
      {
        backgroundColor: "#49d994",
        data: amountArray,
      },
    ],
  },
  options: {
    legend: { display: false },
    title: {
      display: true,
      text: "TLM Earned",
    },
  },
});
drawChart();