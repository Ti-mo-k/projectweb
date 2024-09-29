     // Fetch cattle info when the page loads
     fetch('/viewcattleinformation')
     .then(response => response.json())
     .then(data => {
         const tableBody = document.querySelector('#cattleTable tbody');
         data.forEach(cattle => {
             const row = document.createElement('tr');
             row.innerHTML = `
                 <td>${cattle.name}</td>
                 <td>${cattle.breed}</td>
                 <td>${cattle.gender}</td>

             `;
             tableBody.appendChild(row);
         });
     })
     .catch(error => console.error('Error fetching cattle info:', error));