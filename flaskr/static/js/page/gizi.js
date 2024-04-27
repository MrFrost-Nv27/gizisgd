const tables = {
  gizi: $("#table-gizi").DataTable({
    responsive: true,
    ajax: {
      url: "/api/gizi",
      dataSrc: "data",
    },
    columns: [
      { data: "name" },
      {
        data: "gender",
        render: function (data) {
          return data == "1" ? "Laki-laki" : "Perempuan";
        },
      },
      {
        data: "age",
        render: function (data) {
          return data + " Bulan";
        },
      },
      {
        data: "weight",
        render: function (data) {
          return data + " kg";
        },
      },
      {
        data: "height",
        render: function (data) {
          return data + " cm";
        },
      },
      {
        data: "id",
      },
    ],
  }),
};

$(document).ready(async function () {
  await cloud.add("/api/gizi", {
    name: "gizi",
  });
  cloud.addCallback("gizi", function () {
    tables.gizi.ajax.reload();
  });
  cloud.pull("gizi");
});
