export default class Scene extends Phaser.Scene {
  preload() {
    var pixelWidth = 6;
    var pixelHeight = 6;

    var chick = [
      '...55.......',
      '.....5......',
      '...7888887..',
      '..788888887.',
      '..888088808.',
      '..888886666.',
      '..8888644444',
      '..8888645555',
      '888888644444',
      '88788776555.',
      '78788788876.',
      '56655677776.',
      '456777777654',
      '.4........4.'
    ];

    this.textures.generate('chick', { data: chick, pixelWidth: pixelWidth });

    var alien = [
      '....44........',
      '....44........',
      '......5.......',
      '......5.......',
      '....ABBBBA....',
      '...ABBBBBBA...',
      '..ABB8228BBA..',
      '..BB882288BB..',
      '.ABB885588BBA.',
      'BBBB885588BBBB',
      'BBBB788887BBBB',
      '.ABBB7777BBBA.',
      '.ABBBBBBBBBBA.',
      '.AABBBBBBBBAA.',
      '.AAAAAAAAAAAA.',
      '.5AAAAAAAAAA5.'
    ];

    this.textures.generate('alien', { data: alien, pixelWidth: pixelWidth });

  }
  create() {
    this.scale.on('resize', resize, this);

    let container1 = this.add.container(200, 200)
    let container2 = this.add.container(200, 200)

    /*     var table1 = this.add.rectangle(0, 0, 200, 200, 0xC19A6B).setInteractive() */
    var table1 = this.add.rectangle(0, 0, 200, 200, 0xC19A6B).setInteractive()
    let text1 = this.add.text(0, 0, '1', {
      fontSize: '36px',
      color: '#000000'
    })
    text1.setOrigin(0.5)
    container1.add(table1)
    container1.add(text1)
    container1.setPosition(this.scale.width / 2 - table1.width - 100, this.scale.height / 2)

    /*     var table2 = this.add.rectangle(0, 0, 200, 200, 0xA0522D).setInteractive() */
    var table2 = this.add.rectangle(0, 0, 200, 200, 0xC19A6B).setInteractive()
    let text2 = this.add.text(0, 0, '2', {
      fontSize: '36px',
      color: '#000000'
    })
    text2.setOrigin(0.5)
    container2.add(table2)
    container2.add(text2)
    container2.setPosition(this.scale.width / 2 + table2.width + 100, this.scale.height / 2)

  }


}

function resize(gameSize, baseSize, displaySize, resolution) {
  var width = gameSize.width;
  var height = gameSize.height;

  this.cameras.resize(width, height);

  /*       this.bg.setSize(width, height); */
  /* this.logo.setPosition(width / 2, height / 2); */
}