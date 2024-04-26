let tempdata;
const charts = {};
$(document).ready(async function () {
  await cloud.add("/api/gizi", {
    name: "gizi",
  });
  cloud.pull("gizi");

  if ((tempdata = cloud.get("gizi").data).length > 0) {
    $(`.counter#total`).text(tempdata.length).counterUp();
    $(`.counter#man`)
      .text(tempdata.filter((x) => x.gender == "1").length)
      .counterUp();
    $(`.counter#woman`)
      .text(tempdata.filter((x) => x.gender == "0").length)
      .counterUp();

    let tempStatus = [...new Set(tempdata.map(({ status }) => status))];
    let tempStatusData = [];
    tempStatus.forEach((s) => {
      tempStatusData.push(tempdata.filter((x) => x.status == s).length);
    });
    console.log(tempStatus, tempStatusData);
    charts.status1 = new Chart(document.getElementById("chart-status-1"), {
      type: "bar",
      data: {
        labels: tempStatus,
        datasets: [
          {
            label: "Status Gizi (Bar)",
            data: tempStatusData,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    charts.status2 = new Chart(document.getElementById("chart-status-2"), {
      type: "doughnut",
      data: {
        labels: tempStatus,
        datasets: [
          {
            label: "Status Gizi (Doughnut)",
            data: tempStatusData,
          },
        ],
      },
    });
  }
});
