
var alertApp = (function () {
    var toast = {
        init: function (element, options) {
            var toastElList = [].slice.call(element);
            var toastList = toastElList.map(function (toastEl) {
                toastEl.addEventListener('hidden.bs.toast', function (e) {
                    e.target.remove();
                });
                // Creates an array of toasts (it only initializes them)
                return new bootstrap.Toast(toastEl, options);
            });
            toastList.forEach(toast => toast.show()); // This show them
        }
    };

    return {

        show: function (alertType, text) {
            /// <summary>Dodaje alert na stronie.</summary>
            /// <param name="radius" type="alertType">Typ alertu (info, success, danger, warning).</param>
            /// <param name="radius" type="text">Tekst alertu.</param>

            var icon = "bi-info-circle-fill";
            switch (alertType) {
                case "danger":
                    icon = "bi-exclamation-circle-fill";
                    break;
                case "warning":
                    icon = "bi-exclamation-triangle";
                    break;
            
            }

            var alertHtml = `<div class="toast text-bg-${alertType} pt-3 pb-3 align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
              ${text}
             </div>
              <button type="button" class="btn-close btn-close-white me-0 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>`;

            var alert = $(alertHtml);
            $("#alerts").append(alert);

            var options = {
                animation: true,
                autohide: true,
                delay: 1000000

            }
            toast.init(alert, options);
        },
        serverError: function (xhr) {
            if (xhr) {
                if (xhr.statusText === "abort") {
                    return;
                }

                if (xhr.responseJSON?.Error) {
                    alertApp.show("danger", xhr.responseJSON.Error)
                    return;
                }
            }
            alertApp.show("danger", "Nieoczekiwany błąd");
        }
    }
}());