$(function(){
	var boardRows=20;
	var boardColumns=20;
	
	var positions = {};

  //Hack to make html bindings since modal subobjects are failing
	function makeTable($el,rows,columns){
		for(var i=0;i<rows;i++){
			var $row = $('<tr>')
			var index = 'x'+i;
			positions[index] = {};
			for(var j=0;j<columns;j++){
				var $td = $('<td data-event="click : board.clickHandler" data-bind="text: board.x' + i + '.y' + j + '">');
				var index2 = 'y'+j;
				positions[index][index2] = '';
				$row.append($td);
			}
			$el.append($row);
		}
	}

	makeTable($('.content'),boardRows,boardColumns);

	var Board = Gnd.Model.extend('boards');

	var board = new Board(positions);
  board.set('delay',500);

	board.clickHandler = function(el,ev,ese){
    var path = $(el).attr('data-bind').replace('text: board.','')
    if(el.innerHTML == '') {
      this.set(path,'<div class="life-active"></div>');
    } else {
      this.set(path,'');
    }
  }
  board.stepIn = function(){
    var newLifes = [];
    var deads = [];
    var _this = this;
    for(var row=0;row<boardRows;row++){
      for(var column=0;column<boardColumns;column++){
        var x = row;
        var y = column;

        var lifesAround = 0;
        for(var i=x-1;i<=x+1;i++) {
          var index = i<0 ? (boardColumns-1): i>(boardColumns-1) ? 0 : i;
          for(var j=y-1;j<=y+1;j++) {
            var indexy = j<0 ? (boardRows-1) : j>(boardRows-1) ? 0 : j;
            if(!(index==row && indexy==column)){ // Avoid counting self item
              if(_this['x'+index]['y'+indexy]) {
                lifesAround++;
              } 
            }
          }
        }
        // is currently alive
        var current = _this['x'+row]['y'+column];
        var path = 'x' + row + '.y' + column;
        if(current != '') {
          switch (lifesAround) {
            case 2 :
            case 3 :
              break;
            default :
              deads.push(path);
          }
          // its currently dead
        } else {
          if(lifesAround == 3) {
            newLifes.push(path);    
          }
        }
      }
    }
    _.each(newLifes, function(path){
      _this.set(path,_this._lifesnippet());
    });
    _.each(deads,function(path){
      _this.set(path,'');
    })
  }
  board._lifesnippet = function(){
    return '<div class="life-active"></div>';
  };
  board.play = function(el,ev){
    var _this = this;
    if(!_this.playing) {
      _this.playing = setInterval(function(){
        board.stepIn();
      },_this.get('delay'))
    }
  }
  board.stop = function(){
    if(this.playing) {
      clearTimeout(this.playing)
      this.playing = null;
    }
  }
  board.fillRandom = function(){
    for(var i=0;i<boardRows;i++){
      for(var j=0;j<boardColumns;j++){
        if(Math.floor((Math.random()*10)+1)>8){
          var path = 'x'+i+'.y'+j;
          this.set(path,this._lifesnippet());
        }
      }
    }
  }
  board.empty = function(){
    for(var i=0;i<boardRows;i++){
      for(var j=0;j<boardColumns;j++){
        var path = 'x'+i+'.y'+j;
        this.set(path,'');
      }
    }
  }
  var viewModel = new Gnd.ViewModel(Gnd.$('.gnd-view')[0], {board:board});

  //jquery slider
  $('#slider').slider({
    min:1,
    max:700,
    default:300,
    range: 200,
    value:board.get('delay'),
    change : function(el,ev){
      board.set('delay',ev.value);
      if(board.playing) {
        board.stop();
        board.play();
      }
    }
  });
})