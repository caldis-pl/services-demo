Date.prototype.toString = function () {
    if (this.valueOf()) {
        var dat = new Date(this.valueOf());
        var string = dat.toISOString().substr(0, 10);
        return string;
    }
}

Date.prototype.toUTCDate = function () {
    var d = new Date(this.valueOf());
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
}

Date.prototype.addDays = function (days) {
    var dat = this.toUTCDate();
    dat.setDate(dat.getDate() + days);
    return dat;
}

Date.prototype.addMonths = function (value) {
    var d = this.toUTCDate();
    d.setMonth(d.getMonth() + value);
    return new Date(d);
}