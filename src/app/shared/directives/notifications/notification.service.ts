import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Hiển thị thông báo Swal với giao diện đồng bộ
   * @param title Tiêu đề Swal
   * @param text Nội dung Swal
   * @param icon Loại Swal ('success' | 'error' | 'warning' | 'info')
   * @param confirmText Nội dung nút xác nhận
   * @param showCancelButton Có hiển thị nút Hủy không?
   * @returns Promise<Swal.Result>
   */
  showSwal(
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info',
    confirmText: string,
    showCancelButton: boolean = false
  ) {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: showCancelButton,
      confirmButtonText: confirmText,
      cancelButtonText: 'Hủy',
      background: '#f9f9f9', // Màu nền dịu nhẹ
      customClass: {
        popup: 'swal-popup-custom', // Đồng bộ kích thước
        title: 'swal-title-custom',
        confirmButton:
          icon === 'success'
            ? 'swal-confirm-green'
            : icon === 'error'
            ? 'swal-confirm-red'
            : 'swal-confirm-yellow',
        cancelButton: showCancelButton ? 'swal-cancel-white' : '',
      },
    });
  }

  showSwalWithTimeOut(
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info',
    confirmText: string,
    showCancelButton: boolean = false,
    timeout: number = 0, // Thêm tham số timeout (0 nghĩa là không tự động đóng)
    toast: boolean = true
  ) {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: showCancelButton,
      confirmButtonText: confirmText,
      cancelButtonText: 'Hủy',
      background: '#f9f9f9', // Màu nền dịu nhẹ
      toast: toast,
      timer: timeout > 0 ? timeout : undefined, // Nếu timeout lớn hơn 0, sử dụng giá trị đó
      customClass: {
        popup: 'swal-popup-custom', // Đồng bộ kích thước
        title: 'swal-title-custom',
        confirmButton:
          icon === 'success'
            ? 'swal-confirm-green'
            : icon === 'error'
            ? 'swal-confirm-red'
            : 'swal-confirm-yellow',
        cancelButton: showCancelButton ? 'swal-cancel-white' : '',
      },
    });
  }
}
