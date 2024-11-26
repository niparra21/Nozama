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
    

    async function listUsers() {
        const procedureName = 'sp_GetAllUsers'; // Procedimiento almacenado para obtener usuarios
        const params = {};
    
        try {
            // Llamada al procedimiento almacenado
            const result = await executeProcedure(procedureName, params);
    
            // Verifica si hay datos
            if (!result.data || result.data.length === 0 || result.data[0].length === 0) {
                showPopup('List Users', 'No users found.');
                return;
            }
    
            const users = result.data[0]; // Accede al array de usuarios
    
            // Crear tabla para mostrar los usuarios
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
    
            // Crear encabezados
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['UserID', 'FirstName', 'LastName', 'Email'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.innerText = header;
                th.style.border = '1px solid #ddd';
                th.style.padding = '8px';
                th.style.backgroundColor = '#f4f4f4';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
    
            // Crear filas de usuarios
            const tbody = document.createElement('tbody');
            users.forEach(user => {
                const row = document.createElement('tr');
                headers.forEach(key => {
                    const td = document.createElement('td');
                    td.innerText = user[key] || ''; // Si no hay datos, deja vacío
                    td.style.border = '1px solid #ddd';
                    td.style.padding = '8px';
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
    
            // Mostrar tabla en el pop-up
            showPopup('List Users', table);
        } catch (error) {
            console.error('Error listing users:', error.message);
            showPopup('Error', 'Failed to fetch users. Please try again.');
        }
    }
        
    async function deleteUser() {
        // Crear formulario para solicitar el ID del usuario
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter User ID to delete:';
    
        const input = document.createElement('input');
        input.id = 'userId';
        input.type = 'number';
        input.required = true;
        input.placeholder = 'User ID';
    
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.innerText = 'Delete User';
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
        showPopup('Delete User', form);
    
        // Acción al hacer clic en el botón
        deleteButton.addEventListener('click', async () => {
            const userId = parseInt(input.value, 10);
    
            // Validar el ID del usuario
            if (isNaN(userId) || userId <= 0) {
                alert('Please enter a valid User ID.');
                return;
            }
    
            try {
                const procedureName = 'sp_DeleteUser';
                const params = { UserID: userId };
    
                // Llamar al procedimiento almacenado
                const result = await executeProcedure(procedureName, params);
    
                // Verificar si la API devolvió un error
                if (result.error) {
                    console.error('Error deleting user:', result.details);
                    alert(`Failed to delete user: ${result.details}`);
                    return;
                }
    
                alert('User deleted successfully!');
                closePopup();
            } catch (error) {
                console.error('Error deleting user:', error.message);
    
                // Mostrar mensaje de error detallado si está disponible
                const errorMessage = error?.response?.data?.error || 'An unexpected error occurred.';
                alert(`Failed to delete user: ${errorMessage}`);
            }
        });
    }

    async function listBrands() {
        const procedureName = 'sp_get_all_brands'; // Llama al procedimiento para listar marcas
        const params = {};
    
        try {
            const result = await executeProcedure(procedureName, params);
    
            // Verificar si hay datos
            if (!result.data || result.data.length === 0 || result.data[0].length === 0) {
                showPopup('List Brands', 'No brands found.');
                return;
            }
    
            const brands = result.data[0]; // Accede a los resultados
    
            // Crear tabla
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
    
            // Crear encabezados
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['BrandID', 'Name'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.innerText = header;
                th.style.border = '1px solid #ddd';
                th.style.padding = '8px';
                th.style.backgroundColor = '#f4f4f4';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
    
            // Crear filas
            const tbody = document.createElement('tbody');
            brands.forEach(brand => {
                const row = document.createElement('tr');
                headers.forEach(key => {
                    const td = document.createElement('td');
                    td.innerText = brand[key] || ''; // Si no hay datos, deja vacío
                    td.style.border = '1px solid #ddd';
                    td.style.padding = '8px';
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
    
            // Mostrar en el pop-up
            showPopup('List Brands', table);
        } catch (error) {
            console.error('Error listing brands:', error.message);
            showPopup('Error', 'Failed to fetch brands. Please try again.');
        }
    }
    
    async function listCategories() {
        const procedureName = 'sp_get_all_categories'; // Llama al procedimiento para listar categorías
        const params = {};
    
        try {
            const result = await executeProcedure(procedureName, params);
    
            // Verificar si hay datos
            if (!result.data || result.data.length === 0 || result.data[0].length === 0) {
                showPopup('List Categories', 'No categories found.');
                return;
            }
    
            const categories = result.data[0]; // Accede a los resultados
    
            // Crear tabla
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
    
            // Crear encabezados
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['CategoryID', 'Name'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.innerText = header;
                th.style.border = '1px solid #ddd';
                th.style.padding = '8px';
                th.style.backgroundColor = '#f4f4f4';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
    
            // Crear filas
            const tbody = document.createElement('tbody');
            categories.forEach(category => {
                const row = document.createElement('tr');
                headers.forEach(key => {
                    const td = document.createElement('td');
                    td.innerText = category[key] || ''; // Si no hay datos, deja vacío
                    td.style.border = '1px solid #ddd';
                    td.style.padding = '8px';
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
    
            // Mostrar en el pop-up
            showPopup('List Categories', table);
        } catch (error) {
            console.error('Error listing categories:', error.message);
            showPopup('Error', 'Failed to fetch categories. Please try again.');
        }
    }
    async function listOrders() {
        const procedureName = 'sp_GetAllOrders'; // Procedimiento almacenado para obtener órdenes
        const params = {};
    
        try {
            // Llamada al procedimiento almacenado
            const result = await executeProcedure(procedureName, params);
    
            // Verificar si hay datos
            if (!result.data || result.data.length === 0 || result.data[0].length === 0) {
                showPopup('List Orders', 'No orders found.');
                return;
            }
    
            const orders = result.data[0]; // Accede al array de órdenes
    
            // Crear tabla para mostrar las órdenes
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
    
            // Crear encabezados
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['OrderID', 'UserID', 'UserName', 'DateTime', 'Status', 'Location'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.innerText = header;
                th.style.border = '1px solid #ddd';
                th.style.padding = '8px';
                th.style.backgroundColor = '#f4f4f4';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
    
            // Crear filas de órdenes
            const tbody = document.createElement('tbody');
            orders.forEach(order => {
                const row = document.createElement('tr');
                headers.forEach(key => {
                    const td = document.createElement('td');
                    td.innerText = order[key] || ''; // Si no hay datos, deja vacío
                    td.style.border = '1px solid #ddd';
                    td.style.padding = '8px';
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
    
            // Mostrar tabla en el pop-up
            showPopup('List Orders', table);
        } catch (error) {
            console.error('Error listing orders:', error.message);
            showPopup('Error', 'Failed to fetch orders. Please try again.');
        }
    }    
    async function editOrder() {
        // Crear formulario para solicitar el ID de la orden
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter Order ID to edit:';
    
        const input = document.createElement('input');
        input.id = 'orderId';
        input.type = 'number';
        input.required = true;
        input.placeholder = 'Order ID';
    
        const checkButton = document.createElement('button');
        checkButton.type = 'button';
        checkButton.innerText = 'Check Order';
        checkButton.style.padding = '10px';
        checkButton.style.backgroundColor = '#3697FF';
        checkButton.style.color = '#fff';
        checkButton.style.border = 'none';
        checkButton.style.borderRadius = '5px';
        checkButton.style.cursor = 'pointer';
    
        // Añadir elementos al formulario
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(checkButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Edit Order', form);
    
        // Acción al hacer clic en el botón
        checkButton.addEventListener('click', async () => {
            const orderId = parseInt(input.value, 10);
    
            // Validar el ID de la orden
            if (isNaN(orderId) || orderId <= 0) {
                alert('Please enter a valid Order ID.');
                return;
            }
    
            try {
                const procedureName = 'sp_GetOrderById';
                const params = { OrderID: orderId };
    
                // Llamar al procedimiento almacenado para obtener la orden
                const result = await executeProcedure(procedureName, params);
    
                // Verificar si la API devolvió un error o la orden no existe
                if (result.error || !result.data || result.data.length === 0 || result.data[0].length === 0) {
                    alert('Order not found. Please try again.');
                    closePopup();
                    return;
                }
    
                const order = result.data[0][0]; // Primera fila de la respuesta
                showEditOrderForm(order);
            } catch (error) {
                console.error('Error fetching order:', error.message);
                alert('Failed to fetch order. Please try again.');
            }
        });
    }
    
    // Mostrar el segundo pop-up para editar el estado
    function showEditOrderForm(order) {
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const fields = [
            { id: 'orderId', label: 'Order ID', value: order.OrderID, type: 'text', readonly: true },
            { id: 'userName', label: 'User Name', value: order.UserName, type: 'text', readonly: true },
            { id: 'dateTime', label: 'Date Time', value: order.DateTime, type: 'text', readonly: true },
            { id: 'location', label: 'Location', value: order.Location, type: 'text', readonly: true }
        ];
    
        // Crear campos de solo lectura
        fields.forEach(field => {
            const label = document.createElement('label');
            label.innerText = field.label;
    
            const input = document.createElement('input');
            input.id = field.id;
            input.type = field.type;
            input.value = field.value || '';
            input.readOnly = field.readonly || false;
    
            form.appendChild(label);
            form.appendChild(input);
        });
    
        // Campo desplegable para el estado
        const statusLabel = document.createElement('label');
        statusLabel.innerText = 'Status';
    
        const statusSelect = document.createElement('select');
        statusSelect.id = 'status';
    
        const options = [
            { value: 'P', text: 'Pending' },
            { value: 'S', text: 'Sent' },
            { value: 'R', text: 'Received' }
        ];
    
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.text = option.text;
            if (option.value === order.Status) {
                opt.selected = true; // Selecciona el estado actual de la orden
            }
            statusSelect.appendChild(opt);
        });
    
        form.appendChild(statusLabel);
        form.appendChild(statusSelect);
    
        // Botón para guardar cambios
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.innerText = 'Update Status';
        saveButton.style.padding = '10px';
        saveButton.style.backgroundColor = '#28a745';
        saveButton.style.color = '#fff';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
    
        saveButton.addEventListener('click', async () => {
            const status = statusSelect.value;
    
            try {
                const procedureName = 'sp_UpdateOrderStatus';
                const params = {
                    OrderID: order.OrderID,
                    Status: status
                };
    
                // Llamar al procedimiento almacenado para actualizar el estado
                const result = await executeProcedure(procedureName, params);
    
                // Verificar si la API devolvió un error
                if (result.error) {
                    console.error('Error updating order:', result.details);
                    alert(`Failed to update order: ${result.details}`);
                    return;
                }
    
                alert('Order status updated successfully!');
                closePopup();
            } catch (error) {
                console.error('Error updating order:', error.message);
                alert('Failed to update order. Please try again.');
            }
        });
    
        form.appendChild(saveButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Edit Order', form);
    }
    async function consultOrderLines() {
        // Crear formulario para solicitar el ID de la orden
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter Order ID to consult lines:';
    
        const input = document.createElement('input');
        input.id = 'orderId';
        input.type = 'number';
        input.required = true;
        input.placeholder = 'Order ID';
    
        const consultButton = document.createElement('button');
        consultButton.type = 'button';
        consultButton.innerText = 'Consult Order Lines';
        consultButton.style.padding = '10px';
        consultButton.style.backgroundColor = '#3697FF';
        consultButton.style.color = '#fff';
        consultButton.style.border = 'none';
        consultButton.style.borderRadius = '5px';
        consultButton.style.cursor = 'pointer';
    
        // Añadir elementos al formulario
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(consultButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Consult Order Lines', form);
    
        // Acción al hacer clic en el botón
        consultButton.addEventListener('click', async () => {
            const orderId = parseInt(input.value, 10);
    
            // Validar el ID de la orden
            if (isNaN(orderId) || orderId <= 0) {
                alert('Please enter a valid Order ID.');
                return;
            }
    
            try {
                const procedureName = 'sp_GetOrderLinesByOrderID';
                const params = { OrderID: orderId };
    
                // Llamar al procedimiento almacenado para obtener las líneas de la orden
                const result = await executeProcedure(procedureName, params);
    
                // Verificar si la API devolvió un error o no hay datos
                if (result.error || !result.data || result.data.length === 0 || result.data[0].length === 0) {
                    alert('No lines found for this Order ID.');
                    closePopup();
                    return;
                }
    
                const orderLines = result.data[0]; // Primera tabla de la respuesta
    
                // Crear tabla para mostrar las líneas de la orden
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
    
                // Crear encabezados
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                const headers = ['OrderID', 'Line', 'ProductID', 'ProductName', 'Amount'];
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.innerText = header;
                    th.style.border = '1px solid #ddd';
                    th.style.padding = '8px';
                    th.style.backgroundColor = '#f4f4f4';
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
    
                // Crear filas de líneas de la orden
                const tbody = document.createElement('tbody');
                orderLines.forEach(line => {
                    const row = document.createElement('tr');
                    headers.forEach(key => {
                        const td = document.createElement('td');
                        td.innerText = line[key] || ''; // Si no hay datos, deja vacío
                        td.style.border = '1px solid #ddd';
                        td.style.padding = '8px';
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
    
                // Mostrar tabla en el pop-up
                showPopup('Order Lines', table);
            } catch (error) {
                console.error('Error fetching order lines:', error.message);
                alert('Failed to fetch order lines. Please try again.');
            }
        });
    }
    // Función para crear una marca
    async function createBrand() {
        // Crear formulario para solicitar el nombre de la marca
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter Brand Name:';
    
        const input = document.createElement('input');
        input.id = 'brandName';
        input.type = 'text';
        input.required = true;
        input.placeholder = 'Brand Name';
    
        const createButton = document.createElement('button');
        createButton.type = 'button';
        createButton.innerText = 'Create Brand';
        createButton.style.padding = '10px';
        createButton.style.backgroundColor = '#28a745';
        createButton.style.color = '#fff';
        createButton.style.border = 'none';
        createButton.style.borderRadius = '5px';
        createButton.style.cursor = 'pointer';
    
        // Añadir elementos al formulario
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(createButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Create Brand', form);
    
        // Acción al hacer clic en el botón
        createButton.addEventListener('click', async () => {
            const brandName = input.value.trim();
    
            // Validar el nombre de la marca
            if (!brandName) {
                alert('Please enter a valid brand name.');
                return;
            }
    
            try {
                const procedureName = 'sp_CreateBrand';
                const params = { Name: brandName };
    
                // Llamar al procedimiento almacenado
                const result = await executeProcedure(procedureName, params);
    
                if (result.error) {
                    console.error('Error creating brand:', result.details);
                    alert(`Failed to create brand: ${result.details}`);
                    return;
                }
    
                alert(`Brand created successfully! New Brand ID: ${result.data[0][0].BrandID}`);
                closePopup();
            } catch (error) {
                console.error('Error creating brand:', error.message);
                alert('Failed to create brand. Please try again.');
            }
        });
    }    
    // Función para crear una categoría
    async function createCategory() {
        // Crear formulario para solicitar el nombre de la categoría
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'stretch';
        form.style.gap = '10px';
    
        const label = document.createElement('label');
        label.innerText = 'Enter Category Name:';
    
        const input = document.createElement('input');
        input.id = 'categoryName';
        input.type = 'text';
        input.required = true;
        input.placeholder = 'Category Name';
    
        const createButton = document.createElement('button');
        createButton.type = 'button';
        createButton.innerText = 'Create Category';
        createButton.style.padding = '10px';
        createButton.style.backgroundColor = '#28a745';
        createButton.style.color = '#fff';
        createButton.style.border = 'none';
        createButton.style.borderRadius = '5px';
        createButton.style.cursor = 'pointer';
    
        // Añadir elementos al formulario
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(createButton);
    
        // Mostrar el formulario en el pop-up
        showPopup('Create Category', form);
    
        // Acción al hacer clic en el botón
        createButton.addEventListener('click', async () => {
            const categoryName = input.value.trim();
    
            // Validar el nombre de la categoría
            if (!categoryName) {
                alert('Please enter a valid category name.');
                return;
            }
    
            try {
                const procedureName = 'sp_CreateCategory';
                const params = { Name: categoryName };
    
                // Llamar al procedimiento almacenado
                const result = await executeProcedure(procedureName, params);
    
                if (result.error) {
                    console.error('Error creating category:', result.details);
                    alert(`Failed to create category: ${result.details}`);
                    return;
                }
    
                alert(`Category created successfully! New Category ID: ${result.data[0][0].CategoryID}`);
                closePopup();
            } catch (error) {
                console.error('Error creating category:', error.message);
                alert('Failed to create category. Please try again.');
            }
        });
    }    
    // Asignar eventos a los botones
    document.getElementById('create-product').addEventListener('click', createProduct);
    document.getElementById('list-products').addEventListener('click', listProducts);
    document.getElementById('edit-product').addEventListener('click', editProduct);
    document.getElementById('delete-product').addEventListener('click', deleteProduct);
    document.getElementById('list-users').addEventListener('click', listUsers);
    document.getElementById('delete-user').addEventListener('click', deleteUser);
    document.getElementById('list-brands').addEventListener('click', listBrands);
    document.getElementById('list-categories').addEventListener('click', listCategories);    
    document.getElementById('create-brand').addEventListener('click', createBrand);
    document.getElementById('create-category').addEventListener('click', createCategory);
    document.getElementById('list-orders').addEventListener('click', listOrders);
    document.getElementById('edit-order').addEventListener('click', editOrder);
    document.getElementById('consult-order-lines').addEventListener('click', consultOrderLines);
    // Evento para cerrar el pop-up
    closePopupButton.addEventListener('click', closePopup);
});
