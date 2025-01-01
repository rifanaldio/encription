import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-right",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

class Alert {
  successCreate = () => {
    Toast.fire({
      showCloseButton: true,
      icon: "success",
      title: "Sukses !",
      text : "Berhasil Menambahkan Data"
    });
  };
  successCustom = (title) => {
    Toast.fire({
      showCloseButton: true,
      icon: "success",
      title: "Sukses !",
      text : `${title}`
    });
  };
  successDeleteFile = () => {
    Toast.fire({
      showCloseButton: true,
      icon: "success",
      title: "Sukses !",
      text: "File berhasil dihapus !",
    });
  };

}

export default Alert;
