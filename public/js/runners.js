var classes = []

fetch('/api/admin/jahrgaenge')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    classes = data.results;
    console.log(classes)
  })
  .catch(error => {
    console.error('Error:', error);
  });

  