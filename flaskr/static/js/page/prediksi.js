$("body").on("submit", "form#predict", function (e) {
  e.preventDefault();

  // validasi
  if (!$("form#predict").find("select[name=model_id]").val()) {
    Toast.fire({
      icon: "error",
      title: "Pilih Model",
    });
    return;
  }
  if (!$("form#predict").find("select[name=gender]").val()) {
    Toast.fire({
      icon: "error",
      title: "Pilih jenis kelamin",
    });
    return;
  }

  let id = $("select[name=model_id]").val();
  $(`.page-slider[data-page=learning]`).addClass("active");
  $.ajax({
    type: "POST",
    url: `/api/model/predict/${id}`,
    data: $("form#predict").serialize(),
    success: (response) => {
      Toast.fire({
        icon: response.toast.icon,
        title: response.toast.title,
      });
      $(`.page-slider[data-page=learning]`).removeClass("active");
      $(`span.prediction`).text(response.data[0]);
      cloud.pull("model");
    },
  });
});

$(document).ready(async function () {
  await cloud.add("/api/model", {
    name: "model",
  });
  cloud.addCallback("model", function () {});
  cloud.pull("model");

  if (cloud.get("model").data.length > 0) {
    $(".something").removeClass("hide");
    $("select[name=model_id]").empty();
    $("select[name=model_id]").append(`<option value="" disabled selected>Pilih Model</option>`);
    cloud.get("model").data.forEach((model) => {
      $("select[name=model_id]").append(`<option value="${model.id}">Model ${model.id} (${model.accuracy})</option>`);
    })
    $("select[name=model_id]").formSelect();
  } else {
    $(".nothing").removeClass("hide");
  }

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
