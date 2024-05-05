var fontface = '';
var magicsend = '\x01LUNAFROMJS\x01'
var magicrecv = '\x01LUNAFROMHOST\x01'
function splitfonttext(transwithfont) {
    if (transwithfont.substr(0, magicsend.length) == magicsend) //not trans
    {
        split = transwithfont.search('\x02')
        return transwithfont.substr(split + 1);
    }
    else if (transwithfont.substr(0, magicrecv.length) == magicrecv) {
        transwithfont = transwithfont.substr(magicrecv.length)
        //magic font \x02 text
        split = transwithfont.search('\x02')
        fontface = transwithfont.substr(0, split)
        text = transwithfont.substr(split + 1)
        return text;
    }
    else {
        return transwithfont;
    }
}
function clipboardsender(s, lpsplit) {
    lpsplit = typeof lpsplit !== 'undefined' ? lpsplit : 0
    //magic split \x02 text
    s = magicsend + lpsplit.toString() + '\x02' + s;
    try {
        const _clipboard = require('nw.gui').Clipboard.get();
        _clipboard.set(s, 'text');
        transwithfont = _clipboard.get('text');
    }
    catch (err) {
        try {
            const clipboard = require('electron').clipboard;
            clipboard.writeText(s);
            transwithfont = clipboard.readText();
        }
        catch (err2) {
            return s;
        }
    }
    if (transwithfont.length == 0) return s;
    return splitfonttext(transwithfont)
}
function rpgmakerhook() {

    if (Window_Message.prototype.originstartMessage) return;
    Window_Base.prototype.drawTextEx_origin = Window_Base.prototype.drawTextEx;
    Window_Base.prototype.drawText_origin = Window_Base.prototype.drawText;
    Window_Message.prototype.originstartMessage = Window_Message.prototype.startMessage;
    Bitmap.prototype.origin_makeFontNameText = Bitmap.prototype._makeFontNameText;
    Bitmap.prototype._makeFontNameText = function () {
        if (fontface == '') return this.origin_makeFontNameText();
        return (this.fontItalic ? 'Italic ' : '') +
            this.fontSize + 'px ' + fontface;
    }
    Window_Message.prototype.startMessage = function () {
        gametext = $gameMessage.allText();
        resp = clipboardsender(gametext);
        $gameMessage._texts = [resp]
        this.originstartMessage();
    };
    Window_Base.prototype.drawText = function (text, x, y, maxWidth, align) {
        text = clipboardsender(text, 1)
        return this.drawText_origin(text, x, y, maxWidth, align)
    }
    Window_Base.prototype.drawTextEx = function (text, x, y) {
        text = clipboardsender(text, 1)
        return this.drawTextEx_origin(text, x, y)
    }
}

function tyranohook() {

    if (tyrano.plugin.kag.tag.text.originstart) return;
    tyrano.plugin.kag.tag.text.originstart = tyrano.plugin.kag.tag.text.start;
    tyrano.plugin.kag.tag.chara_ptext.startorigin = tyrano.plugin.kag.tag.chara_ptext.start;
    tyrano.plugin.kag.tag.text.start = function (pm) {
        if (1 != this.kag.stat.is_script && 1 != this.kag.stat.is_html) {
            pm.val = clipboardsender(pm.val);
            if (fontface != '') {
                this.kag.stat.font.face = fontface
            }
        }
        return this.originstart(pm)
    }
    tyrano.plugin.kag.tag.chara_ptext.start = function (pm) {
        pm.name = clipboardsender(pm.name, 1)
        return this.startorigin(pm)
    }
}
function retryinject(times) {
    if (times == 0) return;
    try {
        if (window.tyrano && tyrano.plugin) {
            tyranohook();
        }
        else if (window.Utils && Utils.RPGMAKER_NAME) {
            rpgmakerhook();
        }
        else {
            setTimeout(retryinject, 3000, times - 1);
        }
    }
    catch (err) {
        //非主线程，甚至没有window对象，会弹窗报错
    }
}
retryinject(3)