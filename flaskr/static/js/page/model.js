// const tables = {
//   gizi: $("#table-gizi").DataTable({
//     responsive: true,
//     ajax: {
//       url: "/api/gizi",
//       dataSrc: "data",
//     },
//     columns: [
//       { data: "name" },
//       {
//         data: "gender",
//         render: function (data) {
//           return data == "1" ? "Laki-laki" : "Perempuan";
//         },
//       },
//       {
//         data: "age",
//         render: function (data) {
//           return data + " Bulan";
//         },
//       },
//       {
//         data: "weight",
//         render: function (data) {
//           return data + " kg";
//         },
//       },
//       {
//         data: "height",
//         render: function (data) {
//           return data + " cm";
//         },
//       },
//       {
//         data: "id",
//         render: function (data) {
//           return `<div class="table-control"><a class="waves-effect waves-light btn orange btn-slider" data-target="form" data-action="edit" data-id="${data}"><i class="material-icons left">edit</i></a><a class="waves-effect waves-light btn red btn-slider" data-action="delete" data-id="${data}"><i class="material-icons left">delete</i></a></div>`;
//         },
//       },
//     ],
//   }),
// };

// $("body").on("open", ".page-slider", function (e, data) {
//   $(e.currentTarget).find("form")[0].reset();
//   $(e.currentTarget).find("form input[name=id]").val("");
//   M.updateTextFields();
//   $("select").formSelect();
//   let id = null;
//   switch (data.action) {
//     case "edit":
//       id = $(data.el.currentTarget).data("id");
//       $(e.currentTarget).find("form input[name=id]").val(id);
//       row = cloud.get("gizi").data.find((x) => x.id == id);
//       $.each(row, function (k, v) {
//         $(e.currentTarget)
//           .find("form input[name=" + k + "]")
//           .val(v);
//         $(e.currentTarget)
//           .find("form select[name=" + k + "]")
//           .val(v);
//         if (k == "gender") {
//           $(e.currentTarget)
//             .find("form select[name=" + k + "]")
//             .val(v == true ? "true" : "false");
//         }
//       });
//       M.updateTextFields();
//       $("select").formSelect();
//       break;
//     case "delete":
//       id = $(data.el.currentTarget).data("id");
//       Swal.fire({
//         title: "Hapus data ini?",
//         text: "Data yang di hapus tidak dapat dikembalikan!",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Hapus",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           $.ajax({
//             url: `/api/gizi/${id}`,
//             type: "DELETE",
//             success: (res) => {
//               Toast.fire({
//                 icon: res.toast.icon,
//                 title: res.toast.title,
//               });
//               cloud.pull("gizi");
//             },
//           });
//         }
//       });
//       break;
//     default:
//       break;
//   }
// });

// $("body").on("submit", ".page-slider[data-page=form] form", function (e) {
//   e.preventDefault();

//   // validasi
//   if (!$(e.currentTarget).find("select[name=gender]").val()) {
//     Toast.fire({
//       icon: "error",
//       title: "Pilih jenis kelamin",
//     });
//     return;
//   }
//   if (!$(e.currentTarget).find("select[name=status]").val()) {
//     Toast.fire({
//       icon: "error",
//       title: "Pilih status gizi",
//     });
//     return;
//   }

//   let id = $(e.currentTarget).find("input[name=id]").val();
//   $.ajax({
//     type: "POST",
//     url: id ? `/api/gizi/${id}` : "/api/gizi",
//     data: $(e.currentTarget).serialize(),
//     success: (response) => {
//       Toast.fire({
//         icon: response.toast.icon,
//         title: response.toast.title,
//       });
//       $(e.currentTarget).closest(".page-slider").find(".btn-slider-close").trigger("click");
//       cloud.pull("gizi");
//     },
//   });
// });

// $("body").on("close", ".page-slider", function (e, data) {
//   $(e.currentTarget).find("form")[0].reset();
//   $(e.currentTarget).find("form input[name=id]").val("");
//   M.updateTextFields();
//   $("select").formSelect();
// });

$(document).ready(async function () {
  await cloud.add("/api/model", {
    name: "model",
  });
  cloud.addCallback("model", function () {
    // tables.model.ajax.reload();
  });
  cloud.pull("model");
});
