$(function () {
    servicesApp.init();
});

var ui = (function () {
    return {
        refreshPanelsVisibility: function() {
            var isDateSelected = $("[data-date].active").length > 0;
            $("#availableHoursWrapper").toggleClass("d-none", !isDateSelected);
            
            var isHourSelected = $("[data-time].active").length > 0;
            $("#bookingDetailsWrapper").toggleClass("d-none", !isHourSelected);

            $("#bookingModal").scrollModalBottom();
        },
        renderServices: function (data) {
            var wrapper = $("#serviceGroups");
            wrapper.html("");
            data.forEach((serviceGroup) => {
                var template = Handlebars.compile(
                    $("#serviceGroupTemplate").html()
                );
                var html = template(serviceGroup);
                var element = $(html);

                wrapper.append(element);
            });
        },
        renderModal: function (data) {
            var template = Handlebars.compile($("#modalTemplate").html());
            var html = template(data);
            var element = $(html);
            $("#bookingModal").remove();
            $("body").append(element);
            $("#bookingModal").modal("show");
        },
        renderCalendar: function (d, availableDates) {
            var date = new Date(d.getFullYear(), d.getMonth(), 1);
            var calendar = {
                currentMonth: date,
                prevMonthDate: date.addMonths(-1).toString(),
                nextMonthDate: date.addMonths(1).toString(),
                isPrevMonthDisabled: date < new Date()
            }

            calendar.prevMonthClass = calendar.isPrevMonthDisabled ? "disabled" : "cursor-pointer";
    
            calendar.dateString = date.toLocaleDateString("pl-PL", {year: "numeric", month: "long"});
            calendar.startDate = date;
            calendar.endDate = date.addMonths(1).addDays(-1);
            var sundayIndex = 0;
            var mondayIndex = 1;
            
            while(calendar.startDate.getDay() != mondayIndex){
                calendar.startDate = calendar.startDate.addDays(-1);
            }
    
            while(calendar.endDate.getDay() != sundayIndex){
                calendar.endDate = calendar.endDate.addDays(1);
            }
    
                               
    
            var currentDate = new Date(calendar.startDate);
    
            var innerHtml = ""
            do {
                innerHtml += '<div class="calendar-row">';
    
                for (var i = 0; i < 7; i++) {
                    var isDisabled = currentDate < new Date();
                    var cssDisabled = isDisabled ? "disabled" : "";
                    var isGray =
                        currentDate.getMonth() !== date.getMonth();
                    var cssGray = isGray ? "gray" : "";
    
                    var cssAvailable = "";
                    if (!isDisabled && !isGray) {
                        cssAvailable = availableDates.includes(currentDate.toISOString().split("T")[0]
                        )
                            ? "bg-available"
                            : "bg-unavailable";
                    }
    
                    innerHtml +=
                        `<a class="day ${cssGray} ${cssDisabled} ${cssAvailable}" data-date="${currentDate.toISOString().split("T")[0]}">
                            <div class="name">${currentDate.getDate()}</div>
                        </a>`;
    
                    currentDate.setDate(currentDate.getDate() + 1);
                }
    
                innerHtml += "</div>";
            } while (currentDate < new Date(calendar.endDate));
    
          
            calendar.innerHtml = innerHtml;
            var template = Handlebars.compile(
                $("#calendarTemplate").html()
            );
            
            var html = template(calendar);    
            $("#calendarContainer").html(html);
    
            $("[data-calendar-date]").on("click", function() {
                if($(this).hasClass("disabled")){
                    return;
                }

                
                var dateString = $(this).data("calendar-date");
                modalApp.getAndRenderCalendar(new Date(dateString));
            });

            $("[data-date]").on("click", function() {
                var date = $(this).data("date");

                $("[data-date]").removeClass("active");
                $(this).addClass("active");
                modalApp.getAndRenderHours(new Date(date));
            });
        },
        renderHours: function(data) {
            var html = '';

            if (data.length > 0) {
                for (var i = 0; i < 24; i++) {
                    var group = data.filter(function (item) {
                        return item.AvailableDateTime.getHours() === i;
                    });

                    if (group.length > 0) {
                        html += '<div class="term-row">';
                        group.forEach(function (t) {
                            var time = t.AvailableDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                            html += '<a class="term" data-time="' + time + '" data-id-object="' + t.IdObject + '">' +
                                        time +
                                    '</a>';
                        });
                        html += '</div>';
                    }
                }
            } else {
                html = '<div>Brak terminów na wskazany dzień.</div>';
            }

            $("#availableHoursContainer").html(html);
            ui.refreshPanelsVisibility();

            modalApp.initDateTimeEvents();
        }       
    };
})();

var app = (function () {
    return {
        loader: {
            show: function () {
                document
                    .getElementsByTagName("body")[0]
                    .classList.add("loading");
            },
            hide: function () {
                document
                    .getElementsByTagName("body")[0]
                    .classList.remove("loading");
            },
        },
    };
})();

var servicesApp = (function () {
    var initReservationButtons = function () {
        $("[data-book-service]").on("click", function () {
            var idService = $(this).data("book-service");
            modalApp.showModal(idService);
        });
    };

    var getAndRender = function () {
        app.loader.show();
        caldisApi
            .getServiceGroups()
            .then((groups) => {
                ui.renderServices(groups);
                initReservationButtons();
            })
            .catch((reason) => {
                alertApp.show("danger", "Bład systemu");
                console.log(reason);
            })
            .finally(() => {
                app.loader.hide();
            });
    };

    return {
        init: function () {
            getAndRender();
        },
    };
})();

var modalApp = (function () {
    var _idService = null;

    var selectFirstCalendar = function() {
        $(".select-list-calendars").find(".item").eq(0).addClass("active")
    }

    var getSelectedCalendarId = function() {
        return $(".select-list-calendars").find(".active").data("calendar-id");
    }

    var getSelectedDate = function() {
      var date = $("[data-date].active");
      if(date.length === 1){
        return date.data("date");
      }

      return null;
    }

    var getSelectedTime = function() {
        var time = $("[data-time].active");
        if(time.length === 1){
          return time.data("time");
        }
  
        return null;
    }

    var getSelectedTimeCalendar = function() {
        var time = $("[data-time].active");
        if(time.length === 1){
          return time.data("id-object");
        }
  
        return null;
    }
    var lodaModal = function () {
        var json = {
            IdService: _idService,
        };

        app.loader.show();
        caldisApi
            .getServiceDetails(json)
            .then((serviceDetails) => {
                console.log(serviceDetails);

                ui.renderModal(serviceDetails);
                selectFirstCalendar();
                var date = new Date()
                modalApp.getAndRenderCalendar(date);
                                             
                initValidation();
                initSubmitReservation();
            })
            .catch((reason) => {
                console.log("ERROR:" +  reason);
                alertApp.show("danger", "Bład systemu");
            })
            .finally(() => {
                app.loader.hide();
            });
    };

 
    var initValidation = function () {
        $("#bookingForm").validate({
            errorElement: "span",
            errorClass: "field-validation-error",
            rules: {
                Fullname: {
                    required: true,
                },
                Email: {
                    required: true,
                    email: true,
                },
                Phone: {
                    required: true,
                },
                AcceptTermsOfService: {
                    required: true,
                },
                Agreement1: {
                    required: true,
                },
                Agreement2: {
                    required: true,
                },
                // Add more rules for other form fields if needed
            },
            messages: {
                required: "Pole wymagane.",
                Fullname: {
                    required: "Pole wymagane.",
                },
                Email: {
                    required: "Pole wymagane.",
                    email: "Podaj prawidłowy adres email.",
                },
                Phone: {
                    required: "Pole wymagane.",
                },
                AcceptTermsOfService: {
                    required: "Zgoda wymagana",
                },
                Agreement1: {
                    required: "Zgoda wymagana",
                },
                Agreement2: {
                    required: "Zgoda wymagana",
                },
            },
            errorPlacement: function (error, element) {
                // Check if the element is a checkbox and has the 'checkboxGroup' name
                if (element.is(":checkbox")) {
                    // Place the error message at the end of the parent container
                    error.appendTo(element.closest(".form-check"));
                } else if (element.closest(".form-floating").length > 0) {
                    error.appendTo(element.closest(".form-floating"));
                } else {
                    // For other elements, use the default placement
                    error.insertAfter(element);
                }
            }
        });
    };

    var initSubmitReservation = function () {
        $("#submitReservation").on("click", function () {
            var form = $("#bookingForm");
            var date = getSelectedDate();
            if (!date){
                alertApp.show("primary", "Nie wybrano daty wizyty");
                return;
            }
            
            var time = getSelectedTime();
            if (!time) {
                alertApp.show("primary", "Nie wybrano terminu wizyty");
                return;
            }

            if (form.valid()) {
                app.loader.show();
                var json = form.formToJson();
                json.IdObject = getSelectedTimeCalendar();
                json.Date = getSelectedDate();
                json.Time = getSelectedTime();

                caldisApi
                    .addServiceReservation(json)
                    .then((response) => {
                        console.log(response);

                        var template = Handlebars.compile(
                            $("#bookingCompletedTemplate").html()
                        );
                        var html = template();
                        var element = $(html);
                        $("#bookingModal").find(".modal-body").html(element);
                        $("#bookingModal").find("#submitReservation").remove();
                        $("#bookingModal").find("#closeModal").html("Zamknij");
                    })
                    .catch((reason) => {
                        alertApp.show("danger", "Bład systemu");
                    })
                    .finally(() => {
                        app.loader.hide();
                    });
            } else {
                // The form is not valid, you can display error messages or take appropriate action.
                alertApp.show("primary", "Formularz zawiera błędy");
            }
        });
    };

    return {
        showModal: function (idService) {
            _idService = idService;
            lodaModal(idService);
        },
        getAndRenderCalendar: function(date) {
            app.loader.show();
            caldisApi.getServicesAvailabilityForMonth({
                idServices: [_idService],
                idCalendar: getSelectedCalendarId(),
                date: date
            }).then((availableDates) => {
                ui.renderCalendar(date, availableDates);    
            })
            .catch((reason) => {
                alertApp.show("danger", "Bład systemu");
                console.log(reason);
            })
            .finally(() => {
                app.loader.hide();
            });
        },
        getAndRenderHours: function(date) {
            app.loader.show();
            caldisApi.getServicesAvailabilityHours({
                idServices: [_idService],
                idCalendar: getSelectedCalendarId(),
                date: date
            }).then((data) => {
                data.forEach((item) => {
                    item.AvailableDateTime = new Date(item.AvailableDateTime)
                })
                ui.renderHours(data);    
            })
            .catch((reason) => {
                alertApp.show("danger", "Bład systemu");
                console.log(reason);
            })
            .finally(() => {
                app.loader.hide();
            });
        },
        initDateTimeEvents: function() {
            $("[data-time]").on("click", function() {
                $("[data-time]").removeClass("active");
                $(this).addClass("active");


                app.loader.show()
                debugger;

                var json = {
                    idServices: [_idService],
                    idCalendar: getSelectedTimeCalendar(),
                    date: getSelectedDate(),
                    time: getSelectedTime()
                }
                caldisApi.getServicesSummary(json)
                    .then((summary) => {
                        $("#TotalPriceGross").val(summary.TotalPriceGross.toFixed(2));
                        ui.refreshPanelsVisibility();
                    })
                    .catch((reason) => {
                        alertApp.show("danger", "Bład systemu");
                        console.log(reason);
                    })
                    .finally(() => {
                        app.loader.hide();
                    });
            })
        }
    };
})();
