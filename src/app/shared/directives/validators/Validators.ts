import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static fullNameValidator(control: AbstractControl): ValidationErrors | null {
    const fullName = control.value;

    if (!fullName || fullName.trim().length === 0) {
      return { required: true }; // Kiểm tra rỗng hoặc chỉ chứa dấu cách
    }

    if (/^\s|\s$/.test(fullName)) {
      return { extraSpaces: true }; // Kiểm tra khoảng trắng ở đầu hoặc cuối
    }

    if (/\s{2,}/.test(fullName)) {
      return { multipleSpaces: true }; // Kiểm tra có hơn 1 khoảng trắng giữa các từ
    }

    const words = fullName.trim().split(' ');
    if (words.length < 2) {
      return { minWords: true }; // Phải có ít nhất 2 từ
    }

    if (fullName.length > 100) {
      return { maxLength: true }; // Không vượt quá 100 ký tự
    }

    // Kiểm tra chữ cái đầu viết hoa, các chữ cái sau viết thường
    const capitalizedRegex = /^[A-Z][a-zÀ-ỹ]*$/;

    const isCapitalizedCorrectly = words.every((w: string) =>
      capitalizedRegex.test(w)
    );

    if (!isCapitalizedCorrectly) {
      return { invalidCapitalization: true }; // Chữ cái đầu phải viết hoa, chữ cái sau phải viết thường
    }

    return null;
  }
  static nameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;

    if (!name || name.trim().length === 0) {
      return { required: true }; // Không được để trống
    }

    if (/^\s|\s$/.test(name)) {
      return { extraSpaces: true }; // Không có khoảng trắng ở đầu hoặc cuối
    }

    if (/\s{2,}/.test(name)) {
      return { multipleSpaces: true }; // Không có quá một dấu cách giữa các từ
    }

    if (name.length > 20) {
      return { maxLength: true }; // Không vượt quá 20 ký tự
    }

    // Kiểm tra chữ cái đầu viết hoa, các chữ sau viết thường, hỗ trợ tiếng Việt
    const capitalizedRegex =
      /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]*$/;

    const words = name.trim().split(' ');
    const isCapitalizedCorrectly = words.every((w: string) =>
      capitalizedRegex.test(w)
    );

    if (!isCapitalizedCorrectly) {
      return { invalidCapitalization: true }; // Chữ cái đầu phải viết hoa, chữ cái sau phải viết thường
    }

    return null; // Hợp lệ
  }
  static phoneValidator(control: AbstractControl): ValidationErrors | null {
    const phone = control.value;

    if (!phone || phone.trim().length === 0) {
      return { required: true }; // Không được để trống
    }

    if (/^\s|\s$/.test(phone)) {
      return { extraSpaces: true }; // Không có khoảng trắng ở đầu hoặc cuối
    }

    if (!/^\d{10,11}$/.test(phone)) {
      return { invalidFormat: true }; // Phải là 10-11 chữ số
    }

    if (!/^(0[1-9][0-9]{8,9})$/.test(phone)) {
      return { invalidPhoneNumber: true }; // Kiểm tra số điện thoại hợp lệ tại Việt Nam
    }

    return null; // Hợp lệ
  }

  static invalidString(control: AbstractControl): ValidationErrors | null {
    const str = control.value;
    console.log('Validator called with value: ', str);
    if (!str) {
      return { required: true };
    }
    if (str.trim().length === 0) {
      console.log('Name length = 0');
      return { invalidString: true };
    }

    return null;
  }
}
