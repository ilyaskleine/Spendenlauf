app = new Vue({
    el: '#app',
    data: {
        message: 'Hello from Vue.js!',
        jahrgaenge: [],
        selected: NaN
    },
    mounted: function() {
        vue = this;
        fetch('/api/admin/jahrgaenge')
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.jahrgaenge = data.results;
            this.selected = this.loop[0]
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
