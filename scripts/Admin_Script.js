document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos
    const popupOverlay = document.getElementById('popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const closePopupButton = document.getElementById('close-popup');

    // Mostrar un pop-up con contenido específico
    function showPopup(title, content) {
        popupTitle.innerText = title;

        // Acepta contenido dinámico (HTML) en el mensaje del pop-up
        if (typeof content === 'string') {
            popupMessage.innerHTML = content;
        } else {
            popupMessage.innerHTML = '';
            popupMessage.appendChild(content);
        }

        popupOverlay.style.display = 'flex';
    }

    // Cerrar el pop-up
    function closePopup() {
        popupOverlay.style.display = 'none';
    }

    // Función única para cada botón
    async function createProduct() {
        // Crear formulario dinámico
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        // Campos del formulario
        const fields = [
            { id: 'productName', label: 'Product Name', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'text', required: true },
            { id: 'specification', label: 'Specification', type: 'text', required: true },
            { id: 'stock', label: 'Stock', type: 'number', required: true },
            { id: 'basePrice', label: 'Base Price', type: 'number', step: '0.01', required: true },
            { id: 'discountPercentage', label: 'Discount Percentage', type: 'number', step: '0.01', required: true },
            { id: 'imgUrl', label: 'Image URL', type: 'url', required: true },
            { id: 'categoryId', label: 'Category ID', type: 'number', required: true },
            { id: 'brandId', label: 'Brand ID', type: 'number', required: true }
        ];
    
        // Generar los campos dinámicamente
        fields.forEach(field => {
            const label = document.createElement('label');
            label.innerText = field.label;
    
            const input = document.createElement('input');
            input.id = field.id;
            input.type = field.type;
            input.required = field.required;
            if (field.step) input.step = field.step;
    
            form.appendChild(label);
            form.appendChild(input);
        });
    
        // Botón de enviar
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.innerText = 'Create Product';
        submitButton.style.padding = '10px';
        submitButton.style.backgroundColor = '#3697FF';
        submitButton.style.color = '#fff';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        submitButton.addEventListener('click', async () => {
            // Validar y recolectar los datos del formulario
            const product = {};
            let valid = true;
    
            fields.forEach(field => {
                const value = document.getElementById(field.id).value.trim();
    
                if (field.required && !value) {
                    alert(`${field.label} is required.`);
                    valid = false;
                    return;
                }
    
                if (field.type === 'number' && isNaN(value)) {
                    alert(`${field.label} must be a valid number.`);
                    valid = false;
                    return;
                }
    
                product[field.id] = field.type === 'number' ? parseFloat(value) : value;
            });
    
            if (!valid) return;
    
            // Llamar al procedimiento almacenado
            try {
                const procedureName = 'sp_InsertProduct';
                const params = {
                    ProductName: product.productName,
                    Description: product.description,
                    Specification: product.specification,
                    Stock: product.stock,
                    BasePrice: product.basePrice,
                    DiscountPercentage: product.discountPercentage,
                    ImgURL: product.imgUrl,
                    CategoryID: product.categoryId,
                    BrandID: product.brandId
                };
    
                const result = await executeProcedure(procedureName, params);
                console.log(result);
    
                alert('Product created successfully!');
                closePopup();
            } catch (error) {
                console.error('Error creating product:', error.message);
                alert('Failed to create product. Please try again.');
            }
        });
    
        form.appendChild(submitButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Create Product', form);
    }
    

    // Función para listar productos
    async function listProducts() {
        const procedureName = 'sp_GetAllProducts';
        const params = {};
    
        try {
            // Ejecuta el procedimiento almacenado
            const result = await executeProcedure(procedureName, params);
            console.log(result);
    
            // Verifica si hay datos
            if (!result.data || result.data.length === 0 || result.data[0].length === 0) {
                showPopup('List Products', 'No products found.');
                return;
            }
    
            const products = result.data[0]; // Accede al array interno con los productos
    
            // Generar tabla con los datos obtenidos
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
    
            // Cabecera de la tabla
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
    
            const headers = ['ProductID', 'ProductName', 'Description', 'Specification', 'Stock', 'BasePrice', 'DiscountPercentage', 'ImgURL', 'CategoryID', 'BrandID'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.innerText = header;
                th.style.border = '1px solid #ddd';
                th.style.padding = '8px';
                th.style.backgroundColor = '#f4f4f4';
                th.style.textAlign = 'left';
                headerRow.appendChild(th);
            });
    
            thead.appendChild(headerRow);
            table.appendChild(thead);
    
            // Cuerpo de la tabla
            const tbody = document.createElement('tbody');
    
            products.forEach(product => {
                const row = document.createElement('tr');
    
                headers.forEach(key => {
                    const td = document.createElement('td');
                    td.innerText = product[key] || ''; // Si no hay datos, deja vacío
                    td.style.border = '1px solid #ddd';
                    td.style.padding = '8px';
                    row.appendChild(td); // Asegúrate de añadir las celdas a la fila
                });
    
                tbody.appendChild(row);
            });
    
            table.appendChild(tbody);
    
            // Mostrar la tabla en el pop-up
            showPopup('List Products', table);
        } catch (error) {
            console.error('Error listing products:', error.message);
            showPopup('Error', 'Failed to fetch products. Please try again.');
        }
    }
    

    function editProduct() {
        showPopup('Edit Product', 'This is the form to edit a product.');
    }

    function deleteProduct() {
        showPopup('Delete Product', 'This is the confirmation to delete a product.');
    }

    function listUsers() {
        showPopup('List Users', 'Here are all the users listed.');
    }

    function deleteUser() {
        showPopup('Delete User', 'This is the confirmation to delete a user.');
    }

    // Asignar eventos a los botones
    document.getElementById('create-product').addEventListener('click', createProduct);
    document.getElementById('list-products').addEventListener('click', listProducts);
    document.getElementById('edit-product').addEventListener('click', editProduct);
    document.getElementById('delete-product').addEventListener('click', deleteProduct);
    document.getElementById('list-users').addEventListener('click', listUsers);
    document.getElementById('delete-user').addEventListener('click', deleteUser);

    // Evento para cerrar el pop-up
    closePopupButton.addEventListener('click', closePopup);
});
