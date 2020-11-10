export default class Table {
  constructor(name, scene, x, y) {
    let container = scene.add.container(200, 200)
    let table = scene.add.image(0, 0, 'table')
    let text = scene.add.text(0, 0, name, {
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: '36px',
      color: 'black'
    })
    table.setScale(0.1, 0.1)
    table.setInteractive()
    text.setOrigin(0.5, 1)
    container.add(table)
    container.add(text)
    container.setPosition(x, y)
    this.table = table
  }
}