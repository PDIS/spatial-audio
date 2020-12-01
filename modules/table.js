export default class Table {
  constructor(name, scene, x, y) {
    let container = scene.add.container(200, 70)
    let table = scene.add.rectangle(0, 0, 200, 70, '0x8A0FB')
    let text = scene.add.text(0, 0, name, {
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: '30px',
      color: 'white'
    })
    table.setInteractive({ useHandCursor: true })
    text.setOrigin(0.5, 0.5)
    container.add(table)
    container.add(text)
    container.setPosition(x, y)
    this.table = table
  }
}