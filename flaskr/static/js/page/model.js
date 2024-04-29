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
  if (data.page) {
    $(e.currentTarget).find("form")[0].reset();
    M.updateTextFields();
    $("select").formSelect();
  }
  switch (data.action) {
    case "edit":
      id = $(data.el.currentTarget).data("id");
      $(e.currentTarget).find("form input[name=id]").val(id);
      row = cloud.get("gizi").data.find((x) => x.id == id);
      $.each(row, function (k, v) {
        $(e.currentTarget)
          .find("form input[name=" + k + "]")
          .val(v);
        $(e.currentTarget)
          .find("form select[name=" + k + "]")
          .val(v);
        if (k == "gender") {
          $(e.currentTarget)
            .find("form select[name=" + k + "]")
            .val(v == true ? "true" : "false");
        }
      });
      M.updateTextFields();
      $("select").formSelect();
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
  $(e.currentTarget).find("form")[0].reset();
  M.updateTextFields();
  $("select").formSelect();
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
