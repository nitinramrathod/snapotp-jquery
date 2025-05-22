/*!
 * SnapOTP - Lightweight jQuery OTP Input Plugin
 * Version: 1.0.0
 * Author: Nitin Rathod
 * Author URL: ""
 * Website: https://github.com/nitinramrathod/SnapOTP
 * License: MIT
 * Description: A simple, customizable jQuery plugin to create elegant multi-input OTP fields with auto-focus, paste handling, keyboard navigation, and callbacks.
 * Repository: https://github.com/nitinramrathod/SnapOTP
 * Released: 2025-05-22
 */

(function ($) {
  $.fn.snapOTP = function (options) {
    const settings = $.extend(
      {
        digits: 6,
        onComplete: function (code) {},
        onChange: function () {},
        onEnter: function () {},
        containerClass: "",
        inputClass: "",
        type: "text",
        style: "box",
      },
      options
    );

    this.each(function () {
      const $container = $(this);
      $container.addClass(`snap-otp-container ${settings?.containerClass}`);
      $container.empty();

      for (let i = 0; i < settings.digits; i++) {
        $container.append(
          `<input type="${settings?.type}" maxlength="2" data-style="${settings?.style}" class="snap-otp-input ${settings.inputClass}" />`
        );
      }

      const $inputs = $container.find(".snap-otp-input");

      $inputs.on("input", function (e) {
        const $this = $(this);
        const value = $this.val();
        const index = $inputs.index(this);       

        if (value.length === 1 && index < settings.digits - 1) {
          $inputs.eq(index + 1).focus();
        }
        if (value.length > 1) {
          const lastChar = value.slice(-1); // get last character typed
          $this.val(lastChar); // update only current field
          if (index < $inputs.length - 1) {
            $inputs.eq(index + 1).focus(); // just focus next, no value update
          }
        }

        triggerChange();
        checkComplete();
      });

      $inputs.on("paste", function (e) {
        const pasteData = (e.originalEvent || e).clipboardData
          .getData("text")
          .trim();
        e.preventDefault();

        const chars = pasteData.split("");
        const startIndex = $inputs.index(this);

        for (
          let i = 0;
          i < chars.length && startIndex + i < $inputs.length;
          i++
        ) {
          $inputs.eq(startIndex + i).val(chars[i]);
        }

        const nextIndex = startIndex + chars.length;
        if (nextIndex < $inputs.length) {
          $inputs.eq(nextIndex).focus();
        } else {
          $inputs.last().focus();
        }

        triggerChange();
        checkComplete();
      });

      $inputs.on("keydown", function (e) {
        const index = $inputs.index(this);

        if (e.key === "Backspace") {
          if ($(this).val() === "" && index > 0) {
            $inputs
              .eq(index - 1)
              .val("")
              .focus();
          }
        } else if (e.key === "ArrowLeft") {
          if (index > 0) $inputs.eq(index - 1).focus();
        } else if (e.key === "ArrowRight") {
          if (index < $inputs.length - 1) $inputs.eq(index + 1).focus();
        } else if (e.key === "Enter") {
          settings.onEnter(getValue());
        }
      });

      function getValue() {
        return $inputs
          .map(function () {
            return $(this).val();
          })
          .get()
          .join("");
      }

      function checkComplete() {
        const value = getValue();
        if (value.length === settings.digits && !value.includes("")) {
          settings.onComplete(value);
        }
      }

      function triggerChange() {
        settings.onChange(getValue());
      }

      // Reset method
      $container[0].resetSnapOTP = function () {
        $inputs.val("");
        $inputs.first().focus();
      };

      $inputs.first().focus();
    });

    return this;
  };
})(jQuery);
