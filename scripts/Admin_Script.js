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
    
                // Validar campos requeridos
                if (field.required && !value) {
                    alert(`${field.label} is required.`);
                    valid = false;
                    return;
                }
    
                // Validar números
                if (field.type === 'number' && (isNaN(value) || parseFloat(value) < 0)) {
                    alert(`${field.label} must be a valid non-negative number.`);
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
    
                // Verificar si la API devolvió un error
                if (result.error) {
                    console.error('Error creating product:', result.details);
                    alert(`Failed to create product: ${result.details}`);
                    return;
                }
    
                alert('Product created successfully!');
                closePopup();
            } catch (error) {
                console.error('Error creating product:', error.message);
    
                // Mostrar mensaje de error detallado si está disponible
                const errorMessage = error?.response?.data?.error || 'An unexpected error occurred.';
                alert(`Failed to create product: ${errorMessage}`);
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
    
            const headers = ['ProductID', 'ProductName', 'Description', 'Specification', 'Stock', 'BasePrice', 'DiscountPercentage', 'CategoryID', 'BrandID'];
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
    

    async function editProduct() {
        // Primera fase: Solicitar el ID del producto
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter Product ID:';
    
        const input = document.createElement('input');
        input.id = 'productId';
        input.type = 'number';
        input.required = true;
        input.placeholder = 'Product ID';
    
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.innerText = 'Fetch Product';
        submitButton.style.padding = '10px';
        submitButton.style.backgroundColor = '#3697FF';
        submitButton.style.color = '#fff';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
    
        // Añadir elementos al formulario
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(submitButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Edit Product', form);
    
        // Acción al hacer clic en el botón
        submitButton.addEventListener('click', async () => {
            const productId = parseInt(input.value, 10);
    
            if (isNaN(productId) || productId <= 0) {
                alert('Please enter a valid Product ID.');
                return;
            }
    
            try {
                const procedureName = 'sp_GetProductById_forAdmin';
                const params = { ProductID: productId };
    
                const result = await executeProcedure(procedureName, params);
    
                if (!result.data || result.data.length === 0 || result.data[0].length === 0) {
                    alert('Product not found.');
                    closePopup();
                    return;
                }
    
                const product = result.data[0][0]; // Extraer el producto
                showEditForm(product); // Mostrar el formulario editable
            } catch (error) {
                console.error('Error fetching product:', error.message);
                alert('Failed to fetch product. Please try again.');
                closePopup();
            }
        });
    }
    
    // Segunda fase: Mostrar formulario editable
    function showEditForm(product) {
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const fields = [
            { id: 'productName', label: 'Product Name', value: product.ProductName, type: 'text' },
            { id: 'description', label: 'Description', value: product.Description, type: 'text' },
            { id: 'specification', label: 'Specification', value: product.Specification, type: 'text' },
            { id: 'stock', label: 'Stock', value: product.Stock, type: 'number' },
            { id: 'basePrice', label: 'Base Price', value: product.BasePrice, type: 'number', step: '0.01' },
            { id: 'discountPercentage', label: 'Discount Percentage', value: product.DiscountPercentage, type: 'number', step: '0.01' },
            { id: 'imgUrl', label: 'Image URL', value: product.ImgURL, type: 'url' },
            { id: 'categoryId', label: 'Category ID', value: product.CategoryID, type: 'number' },
            { id: 'brandId', label: 'Brand ID', value: product.BrandID, type: 'number' }
        ];
    
        // Crear los campos del formulario dinámicamente
        fields.forEach(field => {
            const label = document.createElement('label');
            label.innerText = field.label;
    
            const input = document.createElement('input');
            input.id = field.id;
            input.type = field.type;
            input.value = field.value || '';
            if (field.step) input.step = field.step;
    
            form.appendChild(label);
            form.appendChild(input);
        });
    
        // Botón para guardar cambios
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.innerText = 'Save Changes';
        saveButton.style.padding = '10px';
        saveButton.style.backgroundColor = '#28a745';
        saveButton.style.color = '#fff';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
    
        // Acción del botón
        saveButton.addEventListener('click', async () => {
            const updatedProduct = {};
            let valid = true;
    
            fields.forEach(field => {
                const value = document.getElementById(field.id).value.trim();
    
                // Validación: no permitir números negativos ni valores no válidos
                if (field.type === 'number') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        alert(`${field.label} must be a valid non-negative number.`);
                        valid = false;
                        return;
                    }
                    updatedProduct[field.id] = numValue;
                } else {
                    if (!value) {
                        alert(`${field.label} cannot be empty.`);
                        valid = false;
                        return;
                    }
                    updatedProduct[field.id] = value;
                }
            });
    
            if (!valid) return;
    
            try {
                const procedureName = 'sp_UpdateProduct_forAdmin';
                const params = {
                    ProductID: product.ProductID,
                    ...updatedProduct
                };
    
                const result = await executeProcedure(procedureName, params);
    
                // Verificar si la API devolvió un error
                if (result.error) {
                    console.error('Error updating product:', result.details);
                    alert(`Failed to update product: ${result.details}`);
                    return;
                }
    
                alert('Product updated successfully!');
                closePopup();
            } catch (error) {
                console.error('Error updating product:', error.message);
    
                // Mostrar mensaje de error detallado si está disponible
                const errorMessage = error?.response?.data?.error || 'An unexpected error occurred.';
                alert(`Failed to update product: ${errorMessage}`);
            }
        });
    
        form.appendChild(saveButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Edit Product', form);
    }
    
    
    

    async function deleteProduct() {
        // Crear formulario para solicitar el ID del producto
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter Product ID to delete:';
    
        const input = document.createElement('input');
        input.id = 'productId';
        input.type = 'number';
        input.required = true;
        input.placeholder = 'Product ID';
    
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.innerText = 'Delete Product';
        deleteButton.style.padding = '10px';
        deleteButton.style.backgroundColor = '#FF4C4C';
        deleteButton.style.color = '#fff';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '5px';
        deleteButton.style.cursor = 'pointer';
    
        // Añadir elementos al formulario
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(deleteButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Delete Product', form);
    
        // Acción al hacer clic en el botón
        deleteButton.addEventListener('click', async () => {
            const productId = parseInt(input.value, 10);
    
            if (isNaN(productId) || productId <= 0) {
                alert('Please enter a valid Product ID.');
                return;
            }
    
            try {
                const procedureName = 'sp_DeleteProduct';
                const params = { ProductID: productId };
    
                const result = await executeProcedure(procedureName, params);
    
                // Verificar si la API devolvió un error
                if (result.error) {
                    console.error('Error deleting product:', result.details);
                    alert(`Failed to delete product: ${result.details}`);
                    return;
                }
    
                alert('Product deleted successfully!');
                closePopup();
            } catch (error) {
                console.error('Error deleting product:', error.message);
    
                // Mostrar mensaje de error detallado si está disponible
                const errorMessage = error?.response?.data?.error || 'An unexpected error occurred.';
                alert(`Failed to delete product: ${errorMessage}`);
            }
        });
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
