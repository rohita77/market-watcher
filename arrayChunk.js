let math = require('mathjs');

function chunk(array, size) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
  }

let arr = [] ;

for (i=0;i<100;i++) {
    arr.push(math.randomInt(100,1000))
}


chunked_arr = chunk(arr,10)
chunked_arr = chunked_arr.reduce((pV=[],cV,i) => {
   return [...pV,...cV];

});

console.log(chunked_arr);