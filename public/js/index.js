app = new Vue({
    el: '#app',
    data: {
        adminLoggedin: false
    },
    mounted: function() {
        if (document.cookie.match(/^(.*;)?\s*token\s*=\s*[^;]+(.*)?$/)) {
            adminLoggedin = true;
        }
    }
});
