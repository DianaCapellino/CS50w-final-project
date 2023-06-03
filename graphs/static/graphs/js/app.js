document.addEventListener('DOMContentLoaded', () => {
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
    const data_id = document.querySelector('.all-data').id;
    console.log(`Inside quantity of quotes by sales. Data id: ${data_id}`);

    var sales_staff = []
    var q_quotes = []
    var label_name_id = ""
    var label_status_id = ""
    
    // Get the label id 
    fetch(`/data/${data_id}/json/labels`)
    .then(response => response.json())
    .then(list => {
        list.forEach(label => {
            if (label.label_name === "Trab.") {
                label_name_id = label.id
            };
            if (label.label_name === "Status") {
                label_status_id = label.id
            };
        });
    });

    // Get the values to work on the data
    fetch(`/data/${data_id}/json/values`)
    .then(response => response.json())
    .then(list => {
        list.forEach(item => {

            // Get the list of the staff
            if (item.label_id === label_name_id) {
                if (sales_staff.indexOf(item.value) === -1) {
                    sales_staff.push(item.value);
                };
            };
        });
        console.log(sales_staff);

        // Get information from each row
        fetch(`${data_id}/json/rows`)
        .then(response => response.json())
        .then(list => {

            // Get the quantity of rows
            const q_rows = list.length;

            // Check every value in the row
            for (var row_nmb = 1; row_nmb <= q_rows; row_nmb++) {
                fetch(`${data_id}/json/${row_nmb}`)
                .then(response => response.json())
                .then(data => {
                    data.forEach(item => {

                    });
                });
            };
        });

        console.log(q_quotes);

    });
}

function all_data(data_id) {
    location.href = `/data/${data_id}/all`;
}