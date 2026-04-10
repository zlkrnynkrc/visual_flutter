const findCustomWidgetFiles = require('./custom-widget-finder');
const vscode = require('vscode');
const additionalWidgets = [
	{ name: 'SafeArea', icon: '⛨', template: "SafeArea(child: )," },
	{ name: 'Obx', icon: 'obx', template: "Obx(()=>  )," },
	{ name: 'AspectRatio', icon: '◫', template: "AspectRatio(\n\taspectRatio: 16/9,\n\t child: )," },
	{ name: 'ConstrainedBox', icon: '▣', template: "ConstrainedBox(\n\tconstraints: BoxConstraints(),\n\t child: \n)," },
	{ name: 'FractionallySizedBox', icon: '◰', template: "FractionallySizedBox(\n\twidthFactor: 0.5,\n\t heightFactor: 0.5,\n\t child: \n)," },
	{ name: 'LimitedBox', icon: '▦', template: "LimitedBox(\n\tmaxWidth: 100, \n\tmaxHeight: 100, \n\tchild: \n)," },
	{ name: 'Offstage', icon: '◁', template: "Offstage(\n\toffstage: true, \n\tchild: \n)," },
	{ name: 'OverflowBox', icon: '◫', template: "OverflowBox(\n\tmaxWidth: 100, \n\tmaxHeight: 100,\n\t child: \n)," },
	{ name: 'SizedOverflowBox', icon: '◫', template: "SizedOverflowBox(\n\tsize: Size(100, 100),\n\t child: \n)," },
	{ name: 'Transform', icon: '↻', template: "Transform.rotate(\n\tangle: 0.0,\n\t child: \n)," },
	{ name: 'CustomPaint', icon: '🎨', template: "CustomPaint(\n\tpainter: MyPainter(),\n\t child: \n)," },
	{ name: 'ClipRRect', icon: '◭', template: "ClipRRect(\n\tborderRadius: BorderRadius.circular(10),\n\t child: \n)," },
	{ name: 'ClipOval', icon: '⬭', template: "ClipOval(child: )," },
	{ name: 'ClipPath', icon: '⬟', template: "ClipPath(\n\tclipper: MyClipper(),\n\t child: \n)," },
	{ name: 'BackdropFilter', icon: '◎', template: "BackdropFilter(\n\tfilter: ImageFilter.blur(sigmaX: 5, sigmaY: 5), \n\tchild: \n)," },
	{ name: 'Listener', icon: '👂', template: "Listener(\n\tonPointerDown: (event) {\n}, \n\tchild: \n)," },
	{ name: 'IgnorePointer', icon: '⃠', template: "IgnorePointer(\n\tignoring: true, \n\tchild: \n)," },
	{ name: 'AbsorbPointer', icon: '⊝', template: "AbsorbPointer(\n\tabsorbing: true, \n\tchild: \n)," },
	{ name: 'Scrollbar', icon: '▐', template: "Scrollbar(\n\tchild: ListView()\n)," },
	{ name: 'SingleChildScrollView', icon: '↕', template: "SingleChildScrollView(child: )," },
	{ name: 'Dismissible', icon: '↔', template: "Dismissible(\n\tkey: Key('key'),\n\tchild: \n)," },
	{ name: 'DragTarget', icon: '◱', template: "DragTarget(\n\tbuilder: (context, accepted, rejected) { \n\treturn Container(); \n})," },
	{ name: 'Draggable', icon: '⇗', template: "Draggable(child: , feedback: )," },
	{ name: 'ReorderableListView', icon: '☰', template: "ReorderableListView(\n\tchildren: [\n\t], \n\tonReorder: (oldIndex, newIndex) {\n})," },
	{ name: 'ExpansionTile', icon: '▼', template: "ExpansionTile(title: Text('Expansion Tile'), children: [\n])," },
	{ name: 'ExpansionPanelList', icon: '▼', template: "ExpansionPanelList(\n\tchildren: [\n\t],\n\t expansionCallback: (index, isExpanded) {\n})," },
	{ name: 'Chip', icon: '◗', template: "Chip(\n\tlabel: Text('Chip')\n)," },
	{ name: 'Autocomplete', icon: '⌨', template: "Autocomplete<String>(\n\toptionsBuilder: (TextEditingValue textEditingValue) {\n\treturn [\n\t]; \n})," },
	{ name: 'DataTable', icon: '▦', template: "DataTable(\n\tcolumns: [\n\t],\n\t rows: [\n\t]\n)," },
	{ name: 'Stepper', icon: '⋮', template: "Stepper(\n\tsteps: [\n\t],\n\t currentStep: 0\n)," },
	{ name: 'TimePicker', icon: '🕒', template: "showTimePicker(\n\tcontext: context, \n\tinitialTime: TimeOfDay.now())," },
	{ name: 'DatePicker', icon: '📅', template: "showDatePicker(\n\tcontext: context,\n\t initialDate: DateTime.now(),\n\t firstDate: DateTime(2000), \n\tlastDate: DateTime(2100)\n)," },
	{ name: 'BottomSheet', icon: '▁', template: "showBottomSheet(\n\tcontext: context,\n\t builder: (context) => Container()\n)," },
	{ name: 'CupertinoSwitch', icon: '◯', template: "CupertinoSwitch(value: false, onChanged: (value) {\n})," },
	{ name: 'ToggleButtons', icon: '⊟', template: "ToggleButtons(children: [\n\t], isSelected: [\n])," },
	{ name: 'CupertinoSegmentedControl', icon: '⊟', template: "CupertinoSegmentedControl(\n\tchildren: {\n\t}, \nonValueChanged: (value) {\n})," },
	{ name: 'CupertinoSlider', icon: '—○—', template: "CupertinoSlider(\n\tvalue: 0.5,\n\tonChanged: (value) {\n})," },
	{ name: 'RefreshIndicator', icon: '↻', template: "RefreshIndicator(\n\tonRefresh: () \n\tasync {\n\t}, \n\tchild: )," },
	{ name: 'Placeholder', icon: '▢', template: "Placeholder()," },
	{ name: 'RichText', icon: 'T', template: "RichText(\n\ttext: TextSpan(\n\tchildren: [\n]))," },
	{ name: 'SelectableText', icon: 'T', template: "SelectableText('Selectable Text')," },
	{ name: 'DefaultTextStyle', icon: 'T', template: "DefaultTextStyle(\n\tstyle: TextStyle(\n\t), \n\tchild: )," },
	{ name: 'Table', icon: '▦', template: "Table(\n\tchildren: [\n\t])," },
	{ name: 'Visibility', icon: '👁', template: "Visibility(\n\tvisible: true, \n\tchild: )," },
	{ name: 'Builder', icon: '🏗', template: "Builder(\n\tbuilder: (BuildContext context) { \n\treturn Container(); })," },
	{ name: 'LayoutBuilder', icon: '📐', template: "LayoutBuilder(\n\tbuilder: (BuildContext context,\n\tBoxConstraints constraints) { \n\treturn Container(); \n})," },
];
async function getFlutterWidgetsList() {
	try {
		const customWidgets = await findCustomWidgetFiles();

		// Merge with existing widgets (avoiding duplicates)
		const existingWidgetNames = new Set(flutterWidgets.map(w => w.name));
		let newWidgets = customWidgets.filter(w => !existingWidgetNames.has(w.name));
		flutterWidgets.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
		newWidgets.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
		newWidgets.push(...flutterWidgets);
		//flutterWidgets.push(...newWidgets);

		return newWidgets;
	} catch {
		vscode.window.showErrorMessage('Failed to find custom widgets');
	}
}
const flutterWidgets = [
	{ name: 'Container', icon: '▢', template: "Container(child: )," },
	{ name: 'Row', icon: '⇿', template: "Row(children: [\n])," },
	{ name: 'Column', icon: '⇅', template: "Column(children: [\n])," },
	{ name: 'Text', icon: 'T', template: "Text('new text')," },
	{ name: 'Image', icon: '🖼', template: "Image.asset('asset_name')," },
	{ name: 'ListView', icon: '☰', template: "ListView(children: [\n])," },
	{ name: 'GridView', icon: '▦', template: "GridView.builder(\n\titemCount: 0,\n\t itemBuilder: (context, index) => )," },
	{ name: 'Stack', icon: '⇲', template: "Stack(children: [\n])," },
	{ name: 'Expanded', icon: '↔', template: "Expanded(child: )," },
	{ name: 'Flexible', icon: '↕', template: "Flexible(child: )," },
	{ name: 'Padding', icon: '⧈', template: "Padding(\n\tpadding: EdgeInsets.all(8.0),\n\t child: \n)," },
	{ name: 'Center', icon: '⊙', template: "Center(child: )," },
	{ name: 'Align', icon: '⊛', template: "Align(alignment: Alignment.center, child: )," },
	{ name: 'Scaffold', icon: '⋔', template: "Scaffold(appBar: AppBar(title: Text('Title')), body: )," },
	{ name: 'AppBar', icon: '▃', template: "AppBar(title: Text('Title'))," },
	{ name: 'FloatingActionButton', icon: '⊕', template: "FloatingActionButton(\n\tonPressed: () {\n\t},\n\t child: Icon(Icons.add)\n\t)," },
	{ name: 'Card', icon: '▭', template: "Card(child: )," },
	{ name: 'ListTile', icon: '≡', template: "ListTile(\n\ttitle: Text('Title'),\n\t subtitle: Text('Subtitle')\n\t)," },
	{ name: 'SizedBox', icon: '□', template: "SizedBox(width: 100, height: 100, child: )," },
	{ name: 'Divider', icon: '—', template: "Divider()," },
	{ name: 'Icon', icon: '★', template: "Icon(Icons.star)," },
	{ name: 'RaisedButton', icon: '▬', template: "ElevatedButton(onPressed: () {\n\t},\n\t child: Text('Button'))," },
	{ name: 'FlatButton', icon: '▭', template: "TextButton(onPressed: () {\n\t}, child: Text('Button'))," },
	{ name: 'IconButton', icon: '◉', template: "IconButton(icon: Icon(Icons.menu), onPressed: () {\n\t})," },
	{ name: 'Checkbox', icon: '☐', template: "Checkbox(value: false, onChanged: (value) {\n\t})," },
	{ name: 'Switch', icon: '⊙', template: "Switch(\n\tvalue: false,\n\t onChanged: (value) {\n\t}\n)," },
	{ name: 'Slider', icon: '—○—', template: "Slider(\n\tvalue: 0.5,\n onChanged: (value) {\n\t}\n)," },
	{ name: 'TextField', icon: '┃', template: "TextField(\n\tdecoration: InputDecoration(\n\tlabelText: 'Enter text'))," },
	{ name: 'Form', icon: '▤', template: "Form(child: )," },
	{ name: 'FormField', icon: '▢', template: "FormField(\n\tbuilder: (FormFieldState<String> state) {\n\treturn Container(); }\n\t)," },
	{ name: 'DropdownButton', icon: '▼', template: "DropdownButton(\n\titems: [\n\t],\n\t onChanged: (value) {\n\t}\n)," },
	{ name: 'PopupMenuButton', icon: '≡', template: "PopupMenuButton(\n\titemBuilder: (BuildContext context) =>\n\t <PopupMenuEntry>[\n])," },
	{ name: 'Drawer', icon: '☰', template: "Drawer(\n\tchild: ListView(children: [\n\t])\n)," },
	{ name: 'BottomNavigationBar', icon: '▁', template: "BottomNavigationBar(items: [\n])," },
	{ name: 'TabBar', icon: '⋯', template: "TabBar(tabs: [\n])," },
	{ name: 'TabBarView', icon: '⊞', template: "TabBarView(children: [\n])," },
	{ name: 'AlertDialog', icon: '!', template: "AlertDialog(title: Text('Title'),\n\t content: Text('Content'))," },
	{ name: 'SnackBar', icon: '▔', template: "SnackBar(content: Text('Snackbar message'))," },
	{ name: 'CircularProgressIndicator', icon: '◯', template: "CircularProgressIndicator()," },
	{ name: 'LinearProgressIndicator', icon: '━', template: "LinearProgressIndicator()," },
	{ name: 'Tooltip', icon: '?', template: "Tooltip(\nmessage: 'Tooltip message',\n\t child: )," },
	{ name: 'Wrap', icon: '⇌', template: "Wrap(children: [\n])," },
	{ name: 'Opacity', icon: '◯', template: "Opacity(opacity: 0.5, child: )," },
	{ name: 'FutureBuilder', icon: '⟳', template: "FutureBuilder(\n\tfuture: ,\n\t builder: (context, snapshot) {\n\treturn Container(); }\n)," },
	{ name: 'StreamBuilder', icon: '≋', template: "StreamBuilder(\n\tstream: ,\n\t builder: (context, snapshot) { \n\treturn Container(); }\n)," },
	{ name: 'GestureDetector', icon: '👆', template: "GestureDetector(onTap: () {\n\t}, child: )," },
	{ name: 'InkWell', icon: '○', template: "InkWell(onTap: () {\n\t}, child: )," },
	{ name: 'Transform', icon: '↻', template: "Transform.rotate(angle: 0.0, child: )," },
	{ name: 'AnimatedContainer', icon: '▢', template: "AnimatedContainer(\n\tduration: Duration(seconds: 1),\n\t child: )," },
	{ name: 'Hero', icon: '⚡', template: "Hero(\ntag: 'heroTag',\n\t child: )," },
	{
		name: 'StatefulWidget', icon: 'Sf', template: 'class MyWidget extends StatefulWidget {\n\tconst MyWidget({super.key});\n@override\nState<MyWidget> createState() => _MyWidgetState();\n}'
			+ 'class _MyWidgetState extends State<MyWidget> {\n@override\n\tWidget build(BuildContext context) {\n\treturn const Placeholder();\n}\n}'
	},
	{ name: 'StatelessWidget', icon: 'Sl', template: "class MyWidget extends StatelessWidget {\n\tconst MyWidget({super.key});\n\t@override\n\tWidget build(BuildContext context) {\n\treturn constPlaceholder();\n}\n}" },
	...additionalWidgets
];

module.exports = { flutterWidgets, getFlutterWidgetsList };