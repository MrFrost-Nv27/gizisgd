const tables = {
  model: $("#table-model").DataTable({
    responsive: true,
    ajax: {
      url: "/api/model",
      dataSrc: "data",
    },
    columns: [
      {
        data: "created_at",
        render: function (data) {
          return moment(data + "+7").format("DD MMM YYYY HH:mm:ss");
        },
      },
      {
        data: "learning_at",
        render: function (data) {
          return data ? moment(data + "+7").format("DD MMM YYYY HH:mm:ss") : "-";
        },
      },
      {
        data: "testsize",
        render: function (data) {
          return data > 1 ? data + " Fold" : data * 100 + " %";
        },
      },
      {
        data: "accuracy",
      },
      {
        data: "id",
        render: function (data, type, row) {
          return row.accuracy > 0
            ? `<div class="table-control"><a class="waves-effect waves-light btn blue btn-slider" data-target="detail" data-action="detail" data-id="${data}"><i class="material-icons left">arrow_forward</i></a></div>`
            : `<div class="table-control"><a class="waves-effect waves-light btn green btn-slider" data-action="run" data-id="${data}"><i class="material-icons left">play_arrow</i></a></div>`;
        },
      },
    ],
  }),
};

$("body").on("open", ".page-slider", function (e, data) {
  if (data.page == "form") {
    $(e.currentTarget).find("form")[0].reset();
    M.updateTextFields();
    $("select").formSelect();
  }
  switch (data.action) {
    case "detail":
      id = $(data.el.currentTarget).data("id");
      row = cloud.get("model").data.find((x) => x.id == id);
      console.log(row);
      $.ajax({
        type: "GET",
        url: "/api/model/data/" + id,
        success: (results) => {
          results = results.data;
          console.log(results);
          $(`span.loss`).text(row.loss);
          $(`span.alpha`).text(row.alpha);
          $(`span.max_iter`).text(row.max_iter);
          $(`span.testsize`).text(row.testsize > 1 ? row.testsize + " Fold" : row.testsize * 100 + " %");
          $(`span.accuracy`).text(row.accuracy);
          if (row.testsize > 1) {
            $(`.row.tts`).addClass("hide");
            $(`.row.kfold`).removeClass("hide");
            $(`.row.kfold table tbody`).empty();
            const accuracy = [];
            for (let k = 0; k < row.testsize; k++) {
              const ds = results.filter((x) => x.fold == k);
              const pred = {
                benar: 0,
                salah: 0,
              };
              ds.map((x) => {
                if (x.actual == x.predicted) {
                  pred.benar += 1;
                } else {
                  pred.salah += 1;
                }
              });
              accuracy[k] = pred.benar / ds.length;
              $(`.row.kfold table tbody`).append(`<tr><td>${k + 1}</td><td>${pred.benar}</td><td>${pred.salah}</td><td>${ds.length}</td><td>${accuracy[k]}</td></tr>`);
            }
            const highest = accuracy.indexOf(Math.max(...accuracy));
            const lowest = accuracy.indexOf(Math.min(...accuracy));
            $(`.row.kfold table tbody tr`).eq(highest).addClass("highest");
            $(`.row.kfold table tbody tr`).eq(lowest).addClass("lowest");
            console.log(accuracy, highest, lowest);
          } else {
            $(`.row.kfold`).addClass("hide");
            $(`.row.tts`).removeClass("hide");
            const pred = {
              benar: 0,
              salah: 0,
            };
            results.map((x) => {
              if (x.actual == x.predicted) {
                pred.benar += 1;
              } else {
                pred.salah += 1;
              }
            });
            const accuracy = pred.benar / results.length;
            $(`.row.tts table tbody`).empty();
            $(`.row.tts table tbody`).append(`<tr><td>${row.testsize * 100} %</td><td>${pred.benar}</td><td>${pred.salah}</td><td>${results.length}</td><td>${accuracy}</td></tr>`);
          }
        },
      });
      break;
    case "run":
      id = $(data.el.currentTarget).data("id");
      Swal.fire({
        title: "Jalankan Model Ini?",
        text: "Model akan dijalankan secara otomatis",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Jalankan",
      }).then((result) => {
        if (result.isConfirmed) {
          $(`.page-slider[data-page=learning]`).addClass("active");
          $.ajax({
            url: `/api/model/${id}`,
            type: "POST",
            success: (res) => {
              Toast.fire({
                icon: res.toast.icon,
                title: res.toast.title,
              });
              $(`.page-slider[data-page=learning]`).removeClass("active");
              cloud.pull("model");
            },
          });
        }
      });
      break;
    default:
      break;
  }
});

$("body").on("submit", ".page-slider[data-page=form] form", function (e) {
  e.preventDefault();

  // validasi
  if (!$(e.currentTarget).find("select[name=loss]").val()) {
    Toast.fire({
      icon: "error",
      title: "Pilih loss function",
    });
    return;
  }

  $.ajax({
    type: "POST",
    url: "/api/model",
    data: $(e.currentTarget).serialize(),
    success: (response) => {
      Toast.fire({
        icon: response.toast.icon,
        title: response.toast.title,
      });
      $(e.currentTarget).closest(".page-slider").find(".btn-slider-close").trigger("click");
      cloud.pull("model");
    },
  });
});

$("body").on("close", ".page-slider", function (e, data) {
  if (data.page == "form") {
    $(e.currentTarget).find("form")[0].reset();
    M.updateTextFields();
    $("select").formSelect();
  }
});

$(document).ready(async function () {
  await cloud.add("/api/model", {
    name: "model",
  });
  cloud.addCallback("model", function () {
    tables.model.ajax.reload();
  });
  cloud.pull("model");

  let img_index = 0;
  let text_index = 0;

  setInterval(() => {
    if (img_index == loader_urls.length - 1) {
      img_index = 0;
    } else {
      img_index++;
    }

    $(`img.model-loader`).fadeOut("normal", function () {
      $(`img.model-loader`).attr("src", `${loader_urls[img_index]}?` + new Date().getTime());
      $(`img.model-loader`).fadeIn("normal");
    });
  }, 10000);
  setInterval(() => {
    if (text_index == loader_text.length - 1) {
      text_index = 0;
    } else {
      text_index++;
    }
    $(`p.model-loader`).fadeOut("normal", function () {
      $(`p.model-loader em`).text(loader_text[text_index]);
      $(`p.model-loader`).fadeIn("normal");
    });
  }, 4000);
});
