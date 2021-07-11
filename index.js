(async function (){
    const data = (await loadData())
        .map((item, index, list) => item.parentId ? null : mapRow(item, list))
        .filter(item => !!item);
    const rootEl = document.getElementById('root');

    const render = () => {
        const shouldShowActiveOnly = (document.getElementById('filter')).checked;

        rootEl.innerHTML = data.map(r => renderRow(r, shouldShowActiveOnly)).join('');
    };

    rootEl.addEventListener('click', event => {
        handleRowClick(event, data);
        render();
    });

    document.getElementById('filter').addEventListener('change', () => {
        render();
    });


    render();
})();

async function loadData() {
    const resp = await fetch('./data.json');
    return resp.json();
}

function mapRow(row, list) {
    const { isOpened, id, parentId } = row;

    return {
        ...row,
        isOpened: typeof isOpened === 'boolean' ? isOpened : !parentId,
        children: list.filter(item => item.parentId === id).map(child => mapRow(child, list)),
    };
}

function renderRow(row, shouldShowActiveOnly) {
    const { id, parentId, isActive, name, email, balance, isOpened, children } = row;

    if (!isOpened || (shouldShowActiveOnly && !isActive)) {
        return '';
    }

    const childrenRows = shouldShowActiveOnly ? children.filter(c => c.isActive) : children;

    return `<div class="row" id="row${id}">
        <div class="col-id">${id}</div>
        <div class="col-parent">${parentId || '---'}</div>
        <div class="col-name">${name}</div>
        <div class="col-email">${email}</div>
        <div class="col-balance">${balance}</div>
        <div class="col-active">${isActive ? 'active' : 'non active'}</div>
        <div class="col-link">
            <span class="link">${childrenRows.length ? (childrenRows.some(c => !c.isOpened) ? 'open' : 'close') : '---'}</span>
        </div>
    </div>${childrenRows.map(r => renderRow(r, shouldShowActiveOnly)).join('')}`;
}

function handleRowClick(event, rows) {
    const row = event.target.closest('.row');
    const id = parseInt(row.getAttribute('id').replace('row', ''), 10);

    if (!id) {
        return;
    }

    const rowItem = findRow(id, rows);

    if (rowItem) {
        rowItem.children.forEach(item => {
            item.isOpened = !item.isOpened;
            if (!item.isOpened) {
                closeChildren(item);
            }
        });
    }
}

function findRow(id, list){
    for(let i = 0;i < list.length; i++) {
        const row = list[i];
        if (row.id === id) {
            return row;
        }

        const child = findRow(id, row.children);
        if (child) {
            return child;
        }
    }

    return null;
}

function closeChildren(row) {
    row.children.forEach(item => {
        item.isOpened = false;
        closeChildren(item);
    });
}