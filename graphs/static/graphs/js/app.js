var columns = [];
var table = [];
var values = [];

// Get the data id
const data_id = document.querySelector('.all-data').id;

// Get all the data from json
function get_all_data() {

    // Get all the columns
    fetch(`/data/${data_id}/json/labels`)
    .then(response => response.json())
    .then(list => {
        list.forEach(label => {
            columns.push([label.id, label.label_name]);
        });
        
        // Get all the rows
        fetch(`${data_id}/json/rows`)
        .then(response => response.json())
        .then(list => {

            // Get the quantity of rows
            var rows = list.length;
            var row = [];

            // Bring all the values to prepare table
            fetch(`${data_id}/json/values`)
            .then(response => response.json())
            .then(list => {
                list.forEach(item => {
                    values.push(item.value);
                });

                // Build the table with all values
                var value_nmb = 0;

                for (var row_nmb = 1; row_nmb < (rows+1); row_nmb++) {
                    for (var col = 0; col < columns.length; col++) {
                        row.push(values[col+value_nmb]);
                    };
                    table.push(row);
                    row = [];
                    value_nmb = value_nmb + columns.length;
                };
            });
        });
    });
};


document.addEventListener('DOMContentLoaded', () => {

    get_all_data();

    const input_file = document.getElementById('input-file');
    if (input_file != null) {
        input_file.addEventListener("click", upload_file);
    };

    const quote_by_sales = document.getElementById('q-quotes-by-sales');
    if (quote_by_sales != null) {
        quote_by_sales.addEventListener("click", q_quotes_by_sales);
    };

    const all_data_list = document.querySelectorAll('.all-data');
        
    all_data_list.forEach((data) => {
        data.addEventListener("click", () => {
            all_data(data.id);
        });
    });
});


function upload_file () {
    document.getElementById('home').className='d-none';
    document.getElementById('checking-data').className='d-block';
    
}


function q_quotes_by_sales() {
    document.getElementById('q-quotes-by-sales').disabled = true;

    // Prepare the empty tables for the data
    var sales_staff = [];
    var q_quotes = [];
    
    // Fill the first information in the row
    for (var row = 0; row < table.length; row++) {
        for (var col = 0; col < columns.length; col++) {

            // Get the list of the staff
            if (col === 10) {
                if (sales_staff.indexOf(table[row][col]) === -1) {
                    sales_staff.push(table[row][col]);
                };
            };
        };
    };

    // Create an array for each item
    sales_staff.forEach(person => {
        q_quotes.push([person, 0]);
    });

    // Fill the second information in the row
    for (var row = 0; row < table.length; row++) {
        for (var col = 0; col < columns.length; col++) {

            if (col === 11) {
                for (var person = 0; person < sales_staff.length; person++) {
                    if (sales_staff[person] === table[row][10] && table[row][col] === "COTA FIT") {
                        q_quotes.forEach(item => {
                            if (sales_staff[person] === item[0]) {
                                item[1] = item[1] + 1;
                            };
                        });
                    };
                };
            };
        };
    };

    // get the table object in the doucment
    const table_obj = document.getElementById('data-table');

    // Create the table inside the view
    q_quotes.forEach(person => {
        const row_item = document.createElement('tr');
        table_obj.append(row_item);
        person.forEach(item => {
            const data = document.createElement('th');
            data.innerHTML = `<th>${item}</th>`;
            row_item.append(data);
        });
    });
    document.getElementById('chart-view').className = 'd-block container';

    const ctx = document.getElementById('chart');

    new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [`${q_quotes[0][0]}`, `${q_quotes[1][0]}`, `${q_quotes[2][0]}`],
          datasets: [{
            label: '# of Quotes',
            data: [`${q_quotes[0][1]}`, `${q_quotes[1][1]}`, `${q_quotes[2][1]}`],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
}


function all_data(data_id) {
    //location.href = `/data/${data_id}/all`;

}