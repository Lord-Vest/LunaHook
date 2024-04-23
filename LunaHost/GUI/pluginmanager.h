#ifndef LUNA_PLUGINMANAGER_H
#define LUNA_PLUGINMANAGER_H
#include"Plugin/extension.h"
#include"textthread.h"
#include<nlohmann/json.hpp>
class LunaHost;
class confighelper;
enum class addpluginresult{
    success,
    invaliddll,
    isnotaplugins,
    dumplicate
};
struct pluginitem{
    std::string path;
    bool isQt;
    bool isref;
    bool enable;
    pluginitem(const nlohmann::json&);
    pluginitem(const std::wstring&,bool);
    std::wstring wpath();
    nlohmann::json dump() const;
};
struct plugindata{
    typedef wchar_t* (*OnNewSentence_t)(wchar_t*, const InfoForExtension*);

    bool isQt;
    OnNewSentence_t OnNewSentence;
    HMODULE hmodule;
    void clear();
    plugindata(){};
    plugindata(bool,HMODULE);
};
class Pluginmanager{
    std::unordered_map<std::wstring,plugindata>OnNewSentenceS;
    std::optional<LPVOID> checkisvalidplugin(const std::wstring&);
    concurrency::reader_writer_lock OnNewSentenceSLock;
    bool checkisdump(const std::wstring&);
    confighelper* configs;
    LunaHost* host;
    std::array<InfoForExtension, 20> GetSentenceInfo(TextThread& thread);
    void loadqtdlls(std::vector<std::wstring>&collectQtplugs);
public:
    Pluginmanager(LunaHost*);
    bool dispatch(TextThread&, std::wstring& sentence);
    addpluginresult addplugin(const std::wstring&);
    std::optional<std::wstring>selectpluginfile();
     
    pluginitem get(int);
    std::wstring getname(int);
    bool getenable(int);
    void set(int,const pluginitem&);
    void setenable(int ,bool);
    int count();
    void add(const pluginitem&);
    void remove(const std::wstring&);
    void unload(const std::wstring&);
    addpluginresult load(const std::wstring&,bool*isqt=0);
    void swaprank(int,int);
};

#endif