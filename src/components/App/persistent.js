import papa from 'papaparse';

const lsTest = () => {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}
const hasStorage = lsTest()

const byteCount = s => {
    return encodeURI(s).split(/%..|./).length - 1;
}

export const getInitialRows = () => {
    if( !hasStorage) { return [] }

    let csvString = localStorage.getItem('csv');
    if (csvString){
       let csv = papa.parse(csvString, {header: true});
       let rows = csv.data.map((e, i) => ({ id: `row${i}`, selected: false, data: e }) );
       return rows
    }
    else { return [] }
}

export const saveRowState = rows => {
    try {
        let csvString = papa.unparse(rows, { delimiter: ";", })
        localStorage.setItem('csv', csvString);
    } catch (error) {
        console.error(["Cannot store csv, probably to large. ", error])
    }
    
    
}