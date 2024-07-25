import Konva from '../../../src/index.ts';

      var stage = new Konva.Stage({
        container: 'container',
        width: 800,
        height: 200,
      });

      // add canvas element
      var layer = new Konva.Layer();
      stage.add(layer);

      // create shape
      var box = new Konva.Rect({
        x: 50,
        y: 50,
        width: 90,
        height: 50,
        // 填充色
        fill: '#00D2FF',
        // 边框
        stroke: 'black',
        strokeWidth: 20,
        draggable: true,
      });
      layer.add(box);

      // add cursor styling
      box.on('mouseover', function () {
        console.log('box1')
        document.body.style.cursor = 'pointer';
      });
      box.on('mouseout', function () {
        document.body.style.cursor = 'default';
      });



      var box2 = new Konva.Rect({
        x: 80,
        y: 50,
        width: 100,
        height: 50,
        // 填充色
        fill: 'red',
        // 边框
        stroke: 'black',
        strokeWidth: 1,
        draggable: true,
      });
      layer.add(box2);

      // add cursor styling
      box2.on('mouseover', function () {
        console.log('box2')
        document.body.style.cursor = 'pointer';
      });

      box2.on('widthChange',()=>{
        console.log('-=====')
      })

      setTimeout(()=>{
        // box.zIndex(0)
        // stage.width(1300)

      }, 3000)