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
        q_quotes.push([person, 0, 0, 0]);
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
                                item[2] = item[2] + 1;
                            };
                        });
                    };
                    if (sales_staff[person] === table[row][10] && table[row][col] === "COTB FIT") {
                        q_quotes.forEach(item => {
                            if (sales_staff[person] === item[0]) {
                                item[2] = item[2] + 1;
                            };
                        });
                    };
                    if (sales_staff[person] === table[row][10] && table[row][col] === "COTC FIT") {
                        q_quotes.forEach(item => {
                            if (sales_staff[person] === item[0]) {
                                item[2] = item[2] + 1;
                            };
                        });
                    };
                    if (sales_staff[person] === table[row][10] && table[row][col] === "BOOKING1 FIT") {
                        q_quotes.forEach(item => {
                            if (sales_staff[person] === item[0]) {
                                item[3] = item[3] + 1;
                            };
                        });
                    };
                };
            };
        };
    };

    const table_labels = ["Vendedor", "COTA FIT", "COTB FIT", "BOOKING1 FIT"];
    const chart_labels = ["COTA FIT", "COTB FIT", "BOOKING1 FIT"];

    build_table(table_labels, q_quotes);
    build_chart(chart_labels, q_quotes, 'bar', sales_staff);

}


function build_table(labels, data) {

    // Get the table object in the document
    const table_obj = document.getElementById('data-table');

    // Create the table head   
    const thead = document.createElement('thead');
    const trow = document.createElement('tr');
    thead.append(trow);

    for (var i=0; i<labels.length; i++) {
        const th = document.createElement('th');
        th.innerHTML = labels[i];
        trow.append(th);
    }

    table_obj.append(thead);

    // Create the empty table body
    const tbody = document.createElement('tbody');
    table_obj.append(tbody);

    // Create the table inside the view
    data.forEach(person => {
        const row_item = document.createElement('tr');
        tbody.append(row_item);
        person.forEach(item => {
            const data = document.createElement('td');
            data.innerHTML = `${item}`;
            row_item.append(data);
        });
    });
}


function build_chart(labels, data, type, second_labels) {

    // Get the element where the chart is located
    const ctx = document.getElementById('chart');

    // Build the chart according to the number of datasets and type informed
    if (labels.length === 1) {
        new Chart(ctx, {
            type: `${type}`,
            data: {
            labels: second_labels.map(row => row),
            datasets: [
                {
                    label: labels[0],
                    data: data.map(row => row[1]),
                    borderWidth: 1
                }
            ]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
    } else if (labels.length === 2) {
        new Chart(ctx, {
            type: `${type}`,
            data: {
            labels: second_labels.map(row => row),
            datasets: [
                {
                    label: labels[0],
                    data: data.map(row => row[1]),
                    borderWidth: 1
                },
                {
                    label: labels[1],
                    data: data.map(row => row[2]),
                    borderWidth: 1
                }
            ]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
    } else if (labels.length === 3) {
        new Chart(ctx, {
            type: `${type}`,
            data: {
            labels: second_labels.map(row => row),
            datasets: [
                {
                    label: labels[0],
                    data: data.map(row => row[1]),
                    borderWidth: 1
                },
                {
                    label: labels[1],
                    data: data.map(row => row[2]),
                    borderWidth: 1
                },
                {
                    label: labels[2],
                    data: data.map(row => row[3]),
                    borderWidth: 1
                }
            ]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
    } else if (labels.length === 4) {
        new Chart(ctx, {
            type: `${type}`,
            data: {
            labels: second_labels.map(row => row),
            datasets: [
                {
                    label: labels[0],
                    data: data.map(row => row[1]),
                    borderWidth: 1
                },
                {
                    label: labels[1],
                    data: data.map(row => row[2]),
                    borderWidth: 1
                },
                {
                    label: labels[2],
                    data: data.map(row => row[3]),
                    borderWidth: 1
                },
                {
                    label: labels[3],
                    data: data.map(row => row[4]),
                    borderWidth: 1
                }
            ]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
    } else if (labels.length === 5) {
        new Chart(ctx, {
            type: `${type}`,
            data: {
            labels: second_labels.map(row => row),
            datasets: [
                {
                    label: labels[0],
                    data: data.map(row => row[1]),
                    borderWidth: 1
                },
                {
                    label: labels[1],
                    data: data.map(row => row[2]),
                    borderWidth: 1
                },
                {
                    label: labels[2],
                    data: data.map(row => row[3]),
                    borderWidth: 1
                },
                {
                    label: labels[3],
                    data: data.map(row => row[4]),
                    borderWidth: 1
                },
                {
                    label: labels[4],
                    data: data.map(row => row[5]),
                    borderWidth: 1
                }
            ]
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
}


function all_data(data_id) {
    location.href = `/data/${data_id}/all`;
}