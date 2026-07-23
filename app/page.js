'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Settings,
  Key,
  LogOut,
  Plus,
  Trash2,
  Play,
  FileText,
  ExternalLink,
  Database,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  Search,
  ChevronDown,
  CheckSquare,
  Tag,
  Copy,
  Check,
  ShoppingBag,
  ListFilter
} from 'lucide-react';

const translations = {
  zh: {
    manage_sites: "站点管理",
    cf_credentials: "凭证管理",
    sys_settings: "全局配置",
    logout: "退出登录",
    control_panel: "管理控制台",
    websites_generator: "智能生成独立站",
    cloudflare_accounts: "Cloudflare 账号管理",
    platform_config: "系统全局设置",
    desc_sites: "创建、编译并全自动部署独立站群体系。",
    desc_accounts: "管理用于部署子站的 Cloudflare API 授权凭证。",
    desc_settings: "配置 GitHub Webhook 授权参数与系统底层设置。",
    build_site: "新建站点",
    add_account: "添加账号",
    deploy: "一键部署",
    logs: "日志",
    delete: "删除",
    save_settings: "保存配置",
    refresh: "刷新",
    close: "关闭",
    no_sites: "暂无独立站配置",
    no_sites_desc: "点击右上角“新建站点”按钮来添加您的第一个垂直细分独立站。系统将自动配置 D1、Pages 实例及 DNS 绑定。",
    status_building: "编译部署中",
    status_active: "正常运行",
    status_failed: "部署失败",
    status_pending: "等待部署",
    d1_bound: "绑定 D1",
    mail_routing: "邮件转发",
    colors: "色调配置",
    domain: "域名",
    key: "唯一标识",
    cf_identifier: "账号名称",
    cf_account_id: "Cloudflare Account ID",
    cf_token: "API Token",
    no_accounts: "暂无 Cloudflare 凭证",
    no_accounts_desc: "添加 Cloudflare API Token 启用自动化建站与项目编排。",
    github_creds: "GitHub 集成凭证",
    github_creds_desc: "用于向 GitHub Actions 发送 triggers 触发编译动作。",
    github_owner: "GitHub 账号名 (Owner)",
    github_repo: "GitHub 仓库名 (Repository)",
    github_pat: "个人访问令牌 (PAT Token)",
    default_routing: "默认域名转发",
    default_routing_desc: "子站前台页面向 info@yourdomain 发送邮件时，自动转投至此默认邮箱。",
    forward_email: "默认接收转发邮箱",
    update_passcode: "修改管理员密码",
    update_passcode_desc: "修改访问当前管理控制台所需的管理员密码。",
    new_passcode: "新访问密码",
    add_cf_title: "添加 Cloudflare 账号",
    add_cf_alias: "账号别名",
    add_cf_token_desc: "API Token 需具备 D1 与 Pages 编辑权限",
    add_site_title: "配置并生成独立站",
    site_key_name: "站点标识 (Key Name)",
    custom_domain_optional: "自定义域名 (可选)",
    site_template: "主题/类目 (Theme/Category)",
    select_account: "选择 Cloudflare 账户",
    primary_color: "主色调",
    accent_color: "辅助色",
    seo_title: "SEO 标题 (Title Tag)",
    seo_desc: "SEO 描述 (Meta Description)",
    add_config: "确认添加配置",
    deploy_logs_title: "站点部署流水线日志",
    realtime_polling: "正在实时同步 GitHub Actions 编译部署状态...",
    fetched_from_db: "历史日志拉取自管理器 D1 数据库。",
    no_logs: "该站点暂无部署日志，点击部署按钮开始发布。",
    loading_panel: "正在载入 SitesPro 控制面板...",
    logout_confirm: "确定要退出登录吗？",
    delete_account_confirm: "删除此账号会移出其凭证，但不会删除已生成的 Cloudflare D1/Pages 资源。确认删除？",
    delete_site_confirm: "确认要删除此站点的配置信息吗？相应的部署日志也将被清除。",
    account_required: "请先去凭证管理页面添加至少一个 Cloudflare 凭证账户。",
    keyword_analysis: "关键词分析",
    desc_keywords: "查询并评估 Bing 搜索引擎中的关键词及相关词展现量数据。",
    bing_api_key_setting: "Bing Webmaster API Key",
    bing_api_key_desc: "用于获取关键词和长尾词的周/月展现数据，从而评估其市场规模与建站潜力。",
  },
  en: {
    manage_sites: "Manage Sites",
    cf_credentials: "CF Credentials",
    sys_settings: "System Settings",
    logout: "Logout",
    control_panel: "Control Panel",
    websites_generator: "Websites Generator",
    cloudflare_accounts: "Cloudflare Accounts",
    platform_config: "Platform Configuration",
    desc_sites: "Create, build and launch dynamic affiliate networks.",
    desc_accounts: "Manage multi-tenant Cloudflare API credentials.",
    desc_settings: "Configure compilation credentials and global properties.",
    build_site: "Build Site",
    add_account: "Add Account",
    deploy: "Deploy",
    logs: "Logs",
    delete: "Delete",
    save_settings: "Save Settings",
    refresh: "Refresh",
    close: "Close",
    no_sites: "No websites configured",
    no_sites_desc: "Get started by adding your first vertical niche domain. We will automatically script the Cloudflare D1, Pages and DNS records.",
    status_building: "Building",
    status_active: "Active",
    status_failed: "Failed",
    status_pending: "Pending",
    d1_bound: "D1 Bound",
    mail_routing: "Mail routing",
    colors: "Colors",
    domain: "Domain",
    key: "Key",
    cf_identifier: "Account Identifier",
    cf_account_id: "Cloudflare Account ID",
    cf_token: "API Token",
    no_accounts: "No Cloudflare Accounts Added",
    no_accounts_desc: "Add Cloudflare developer API tokens to enable deployment automation.",
    github_creds: "GitHub Integration Credentials",
    github_creds_desc: "Used to dispatch repository webhook actions for compiling sites.",
    github_owner: "GitHub Owner",
    github_repo: "GitHub Repository Name",
    github_pat: "Personal Access Token (PAT)",
    default_routing: "Default Domain Routing",
    default_routing_desc: "Default target email to forward the domain info inquiries to.",
    forward_email: "Forwarding Target Email",
    update_passcode: "Update Passcode",
    update_passcode_desc: "Change the manager passcode required to log in to this panel.",
    new_passcode: "New Access Passcode",
    add_cf_title: "Add Cloudflare Account",
    add_cf_alias: "Alias Name",
    add_cf_token_desc: "Requires D1 Edit, Pages Edit permissions",
    add_site_title: "Configure New Site",
    site_key_name: "Site Key Name",
    custom_domain_optional: "Custom Domain (Optional)",
    site_template: "Theme / Category",
    select_account: "Select Account",
    primary_color: "Primary Color",
    accent_color: "Accent Color",
    seo_title: "SEO Title Tag",
    seo_desc: "SEO Meta Description",
    add_config: "Add Configuration",
    deploy_logs_title: "Deployment Sequence Logs",
    realtime_polling: "Real-time polling active. Waiting for GitHub Actions completion...",
    fetched_from_db: "Log history fetched from manager database.",
    no_logs: "No deploy logs found for this site. Click Deploy to start.",
    loading_panel: "Loading SitesPro Panel...",
    logout_confirm: "Are you sure you want to logout?",
    delete_account_confirm: "Deleting this account will remove its credentials from the manager. Existing Cloudflare deployments won't be deleted. Proceed?",
    delete_site_confirm: "Are you sure you want to delete this site configuration? Deployment history will be removed.",
    account_required: "Please configure at least one Cloudflare API Account first.",
    keyword_analysis: "Keyword Analysis",
    desc_keywords: "Query and evaluate search impressions for core and related keywords using Bing Webmaster API.",
    bing_api_key_setting: "Bing Webmaster API Key",
    bing_api_key_desc: "Used to retrieve weekly and monthly impressions for keywords to assess niche potential.",
  }
};

const BING_COUNTRIES = [
  { code: '', name: '全部国家 (All)' },
  { code: 'us', name: 'United States (美国)' },
  { code: 'cn', name: 'China (中国)' },
  { code: 'gb', name: 'United Kingdom (英国)' },
  { code: 'ca', name: 'Canada (加拿大)' },
  { code: 'au', name: 'Australia (澳大利亚)' },
  { code: 'de', name: 'Germany (德国)' },
  { code: 'fr', name: 'France (法国)' },
  { code: 'jp', name: 'Japan (日本)' },
  { code: 'kr', name: 'South Korea (韩国)' },
  { code: 'ru', name: 'Russia (俄罗斯)' },
  { code: 'in', name: 'India (印度)' },
  { code: 'br', name: 'Brazil (巴西)' },
  { code: 'mx', name: 'Mexico (墨西哥)' },
  { code: 'it', name: 'Italy (意大利)' },
  { code: 'es', name: 'Spain (西班牙)' },
  { code: 'nl', name: 'Netherlands (荷兰)' },
  { code: 'se', name: 'Sweden (瑞典)' },
  { code: 'ch', name: 'Switzerland (瑞士)' },
  { code: 'sg', name: 'Singapore (新加坡)' },
  { code: 'hk', name: 'Hong Kong (香港)' },
  { code: 'tw', name: 'Taiwan (台湾)' },
  { code: 'my', name: 'Malaysia (马来西亚)' },
  { code: 'th', name: 'Thailand (泰国)' },
  { code: 'vn', name: 'Vietnam (越南)' },
  { code: 'ph', name: 'Philippines (菲律宾)' },
  { code: 'id', name: 'Indonesia (印尼)' },
  { code: 'nz', name: 'New Zealand (新西兰)' },
  { code: 'za', name: 'South Africa (南非)' },
  { code: 'tr', name: 'Turkey (土耳其)' },
  { code: 'sa', name: 'Saudi Arabia (沙特)' },
  { code: 'ae', name: 'United Arab Emirates (阿联酋)' },
  { code: 'pl', name: 'Poland (波兰)' },
  { code: 'be', name: 'Belgium (比利时)' },
  { code: 'at', name: 'Austria (奥地利)' },
  { code: 'dk', name: 'Denmark (丹麦)' },
  { code: 'no', name: 'Norway (挪威)' },
  { code: 'fi', name: 'Finland (芬兰)' },
  { code: 'ie', name: 'Ireland (爱尔兰)' },
  { code: 'pt', name: 'Portugal (葡萄牙)' },
  { code: 'gr', name: 'Greece (希腊)' },
  { code: 'il', name: 'Israel (以色列)' }
];

const BING_LANGUAGES = [
  { code: '', name: '全部语言 (All)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'zh-CN', name: 'Chinese (Simplified, PRC)' },
  { code: 'zh-TW', name: 'Chinese (Traditional, Taiwan)' },
  { code: 'zh-HK', name: 'Chinese (Traditional, Hong Kong)' },
  { code: 'ja-JP', name: 'Japanese (日本)' },
  { code: 'ko-KR', name: 'Korean (韩国)' },
  { code: 'de-DE', name: 'German (德国)' },
  { code: 'fr-FR', name: 'French (法国)' },
  { code: 'es-ES', name: 'Spanish (西班牙)' },
  { code: 'it-IT', name: 'Italian (意大利)' },
  { code: 'ru-RU', name: 'Russian (俄罗斯)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'nl-NL', name: 'Dutch (荷兰)' },
  { code: 'sv-SE', name: 'Swedish (瑞典)' },
  { code: 'pl-PL', name: 'Polish (波兰)' },
  { code: 'tr-TR', name: 'Turkish (土耳其)' },
  { code: 'ar-SA', name: 'Arabic (沙特)' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sites');
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('zh');
  const [mounted, setMounted] = useState(false);

  // Data states
  const [sites, setSites] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [sysSettings, setSysSettings] = useState({
    github_token: '',
    github_owner: '',
    github_repo: '',
    default_forward_email: '',
    admin_password: '',
    bing_api_key: '',
    amazon_scraper_type: 'direct',
    amazon_scraper_key: '',
  });

  // Keyword Analysis states
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordCountry, setKeywordCountry] = useState('');
  const [keywordLanguage, setKeywordLanguage] = useState('');
  const [keywordThreshold, setKeywordThreshold] = useState(300);
  const [keywordPeriod, setKeywordPeriod] = useState('3m');
  const [keywordDevice, setKeywordDevice] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [showFilteredKeywords, setShowFilteredKeywords] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  // Keyword DB Management states
  const [savedKeywords, setSavedKeywords] = useState([]);

  // Amazon ASIN and Product Management states
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [activeSiteForProducts, setActiveSiteForProducts] = useState(null);
  const [siteProducts, setSiteProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [importAsin, setImportAsin] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importDomain, setImportDomain] = useState('amazon.com');
  const [importLanguage, setImportLanguage] = useState('en_US');
  const [importZipcode, setImportZipcode] = useState('');
  const [importProgress, setImportProgress] = useState('');
  const [importVisualize, setImportVisualize] = useState('no');
  const [crawledPreview, setCrawledPreview] = useState(null);
  const [publishDirectly, setPublishDirectly] = useState(false);
  const [crawlingLogs, setCrawlingLogs] = useState([]);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [keywordsSearchQuery, setKeywordsSearchQuery] = useState('');

  // ASIN Search & Extraction states
  const [asinSearchQuery, setAsinSearchQuery] = useState('');
  const [asinSearchDomain, setAsinSearchDomain] = useState('amazon.com');
  const [asinSearchLanguage, setAsinSearchLanguage] = useState('en_US');
  const [asinSearchLimit, setAsinSearchLimit] = useState(100);
  const [asinSearchResults, setAsinSearchResults] = useState([]);
  const [asinSearchLoading, setAsinSearchLoading] = useState(false);
  const [asinSearchError, setAsinSearchError] = useState(null);
  const [selectedAsins, setSelectedAsins] = useState([]);
  const [copyFormat, setCopyFormat] = useState('newline');
  const [copiedToast, setCopiedToast] = useState(null);
  const [showImportToSiteModal, setShowImportToSiteModal] = useState(false);

  const handleSearchAmazonAsins = async (e) => {
    if (e) e.preventDefault();
    if (!asinSearchQuery.trim()) return;

    setAsinSearchLoading(true);
    setAsinSearchError(null);
    setAsinSearchResults([]);
    setSelectedAsins([]);

    try {
      const isLocalScraper = sysSettings.amazon_scraper_type === 'local';
      let results = [];
      let success = false;

      if (isLocalScraper) {
        try {
          const localScraperUrl = 'http://localhost:3005';
          const localRes = await fetch(`${localScraperUrl}/scrape-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: asinSearchQuery.trim(),
              domain: asinSearchDomain,
              language: asinSearchLanguage,
              limit: asinSearchLimit,
              headless: true
            })
          });
          if (localRes.ok) {
            const data = await localRes.json();
            results = data.results || [];
            success = true;
          }
        } catch (localErr) {
          console.warn('本地抓取助手未在运行或无响应，自动平滑切入云端模式抓取:', localErr);
        }
      }

      if (!success) {
        const apiRes = await fetch('/api/amazon-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: asinSearchQuery.trim(),
            domain: asinSearchDomain,
            language: asinSearchLanguage,
            limit: asinSearchLimit
          })
        });
        if (!apiRes.ok) {
          const errJson = await apiRes.json().catch(() => ({}));
          throw new Error(errJson.error || '云端抓取响应失败，请重试。');
        }
        const data = await apiRes.json();
        results = data.results || [];
      }

      setAsinSearchResults(results);
      if (results.length === 0) {
        setAsinSearchError(lang === 'zh' ? '未找到相关 Amazon 商品，请尝试更换搜索关键词或检查本地抓取助手。' : 'No products found. Try another search query.');
      }
    } catch (err) {
      console.error('Amazon ASIN search error:', err);
      const errMsg = err.message === 'Failed to fetch'
        ? (lang === 'zh' ? '网络请求失败。如果使用本地抓取助手，请确保在终端运行 npm run local-scraper 启动助手。' : 'Network request failed. Ensure local scraper (npm run local-scraper) is running.')
        : (err.message || '搜索处理异常');
      setAsinSearchError(errMsg);
    } finally {
      setAsinSearchLoading(false);
    }
  };

  const handleToggleSelectAllAsins = () => {
    if (selectedAsins.length === asinSearchResults.length) {
      setSelectedAsins([]);
    } else {
      setSelectedAsins(asinSearchResults.map(item => item.asin));
    }
  };

  const handleToggleSelectOneAsin = (asin) => {
    if (selectedAsins.includes(asin)) {
      setSelectedAsins(prev => prev.filter(a => a !== asin));
    } else {
      setSelectedAsins(prev => [...prev, asin]);
    }
  };

  const handleCopyAsins = (asinsToCopy, customMsg) => {
    const list = asinsToCopy || selectedAsins;
    if (!list || list.length === 0) return;
    const text = copyFormat === 'comma' ? list.join(', ') : list.join('\n');
    navigator.clipboard.writeText(text);
    const msg = customMsg || (lang === 'zh' ? `已成功复制 ${list.length} 个 ASIN 到剪贴板！` : `Copied ${list.length} ASIN(s) to clipboard!`);
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  const handleCopySingleAsin = (asin) => {
    navigator.clipboard.writeText(asin);
    setCopiedToast(lang === 'zh' ? `已复制 ASIN: ${asin}` : `Copied ASIN: ${asin}`);
    setTimeout(() => setCopiedToast(null), 2000);
  };

  const handleOpenImportToSite = (site) => {
    if (!site) return;
    const asinsText = (selectedAsins.length > 0 ? selectedAsins : asinSearchResults.map(r => r.asin)).join(', ');
    openProductsManager(site);
    setImportAsin(asinsText);
    setImportDomain(asinSearchDomain);
    setImportLanguage(asinSearchLanguage);
    setShowImportToSiteModal(false);
  };

  const fetchSavedKeywords = async () => {
    setKeywordsLoading(true);
    try {
      const res = await fetch('/api/keywords');
      if (res.ok) {
        const data = await res.json();
        setSavedKeywords(data);
      }
    } catch (err) {
      console.error('Failed to load saved keywords:', err);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const handleDeleteKeyword = async (id) => {
    if (!confirm(lang === 'zh' ? '确定要从数据库中删除此关键词吗？' : 'Are you sure you want to delete this keyword from the database?')) {
      return;
    }
    try {
      const res = await fetch(`/api/keywords?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete keyword');
      await fetchSavedKeywords();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleSelectAll = () => {
    const allRelated = analyzeResult ? [
      { keyword: analyzeResult.keyword, impressions: analyzeResult.impressions, passed: analyzeResult.passed },
      ...(analyzeResult.related || [])
    ] : [];
    const visibleKeywords = allRelated.filter(item => showFilteredKeywords || item.passed);

    if (selectedKeywords.length === visibleKeywords.length) {
      setSelectedKeywords([]);
    } else {
      setSelectedKeywords(visibleKeywords.map(item => item.keyword));
    }
  };

  const handleToggleSelectOne = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(prev => prev.filter(k => k !== keyword));
    } else {
      setSelectedKeywords(prev => [...prev, keyword]);
    }
  };

  const handleBatchSaveKeywords = async () => {
    if (selectedKeywords.length === 0 || !analyzeResult) return;

    const allRelated = [
      { keyword: analyzeResult.keyword, impressions: analyzeResult.impressions },
      ...(analyzeResult.related || [])
    ];

    const toSave = selectedKeywords.map(k => {
      const match = allRelated.find(item => item.keyword === k);
      return {
        keyword: k,
        impressions: match ? match.impressions : 0
      };
    });

    try {
      setAnalyzeLoading(true);
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: toSave })
      });
      if (!res.ok) throw new Error('Failed to save keywords');
      alert(lang === 'zh' ? `成功保存 ${toSave.length} 个关键词到数据库！` : `Successfully saved ${toSave.length} keywords to database!`);
      setSelectedKeywords([]);
      await fetchSavedKeywords();
    } catch (err) {
      alert(err.message);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleAnalyzeKeyword = async (e) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setAnalyzeResult(null);
    try {
      const q = encodeURIComponent(keywordInput.trim());
      let url = `/api/keywords/analyze?keyword=${q}&country=${keywordCountry}&language=${keywordLanguage}&threshold=${keywordThreshold}&period=${keywordPeriod}&device=${keywordDevice}`;
      if (keywordPeriod === 'custom') {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze keyword');
      setAnalyzeResult(data);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Form states
  const [accountForm, setAccountForm] = useState({ name: '', api_token: '', account_id: '' });
  const [siteForm, setSiteForm] = useState({
    name: '',
    domain: '',
    cf_account_id: '',
    primary_color: '#0f4c81',
    accent_color: '#00b4d8',
    seo_title: '',
    seo_description: '',
    template: 'apparel',
    email_forwarding: 0,
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_mode: 'sandbox',
    custom_html_tags: '',
  });

  const [showEditSiteModal, setShowEditSiteModal] = useState(false);
  const [editingSiteForm, setEditingSiteForm] = useState({
    id: null,
    name: '',
    domain: '',
    cf_account_id: '',
    primary_color: '#0f4c81',
    accent_color: '#00b4d8',
    seo_title: '',
    seo_description: '',
    template: 'apparel',
    email_forwarding: 0,
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_mode: 'sandbox',
    custom_html_tags: '',
  });

  // Log viewer states
  const [activeSiteForLogs, setActiveSiteForLogs] = useState(null);
  const [deployLogs, setDeployLogs] = useState([]);
  const [logsPolling, setLogsPolling] = useState(null);

  // Actions loading states
  const [actionLoading, setActionLoading] = useState(false);

  // Helper translate
  const t = (key) => {
    return translations[lang][key] || key;
  };

  // Fetch initial data & initialize theme/lang
  const fetchData = async () => {
    try {
      const [sitesRes, accountsRes, settingsRes] = await Promise.all([
        fetch('/api/sites'),
        fetch('/api/accounts'),
        fetch('/api/settings'),
      ]);

      if (sitesRes.status === 401 || accountsRes.status === 401) {
        router.push('/login');
        return;
      }

      const sitesData = await sitesRes.json();
      const accountsData = await accountsRes.json();
      const settingsData = await settingsRes.json();

      setSites(sitesData.sites || []);
      setAccounts(accountsData.accounts || []);
      setSysSettings(settingsData);
      await fetchSavedKeywords();
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Theme initialization (defaulting to light)
    const storedTheme = localStorage.getItem('sitespro_theme');
    const initialDark = storedTheme === 'dark';
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Language initialization (defaulting to Chinese 'zh')
    const storedLang = localStorage.getItem('sitespro_lang');
    setLang(storedLang === 'en' ? 'en' : 'zh');
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('sitespro_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLang = () => {
    const nextLang = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    localStorage.setItem('sitespro_lang', nextLang);
  };

  // Poll status of deploying sites every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const hasDeploying = sites.some(s => s.deploy_status === 'deploying');
      if (hasDeploying) {
        fetch('/api/sites')
          .then(res => res.json())
          .then(data => {
            if (data.sites) setSites(data.sites);
          })
          .catch(err => console.error(err));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sites]);

  const handleLogout = async () => {
    if (!confirm(t('logout_confirm'))) return;
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  // ----------------------------------------------------
  // Cloudflare Accounts CRUD
  // ----------------------------------------------------
  const handleAddAccount = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      });
      if (!res.ok) throw new Error('Failed to save account');
      setAccountForm({ name: '', api_token: '', account_id: '' });
      setShowAccountModal(false);
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm(t('delete_account_confirm'))) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // Sites CRUD
  // ----------------------------------------------------
  const handleAddSite = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteForm),
      });
      if (!res.ok) throw new Error('Failed to save site configuration');
      setSiteForm({
        name: '',
        domain: '',
        cf_account_id: '',
        primary_color: '#0f4c81',
        accent_color: '#00b4d8',
        seo_title: '',
        seo_description: '',
        template: 'sitespro',
        email_forwarding: 0,
        paypal_client_id: '',
        paypal_client_secret: '',
        paypal_mode: 'sandbox',
        custom_html_tags: '',
      });
      setShowSiteModal(false);
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSite = (site) => {
    setEditingSiteForm({
      id: site.id,
      name: site.name || '',
      domain: site.domain || '',
      cf_account_id: site.cf_account_id || '',
      primary_color: site.primary_color || '#0f4c81',
      accent_color: site.accent_color || '#00b4d8',
      seo_title: site.seo_title || '',
      seo_description: site.seo_description || '',
      template: site.template || 'sitespro',
      email_forwarding: site.email_forwarding || 0,
      paypal_client_id: site.paypal_client_id || '',
      paypal_client_secret: site.paypal_client_secret || '',
      paypal_mode: site.paypal_mode || 'sandbox',
      custom_html_tags: site.custom_html_tags || '',
    });
    setShowEditSiteModal(true);
  };

  const handleUpdateSite = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/sites/${editingSiteForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSiteForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update site configuration');
      }
      setShowEditSiteModal(false);
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSite = async (id) => {
    if (!confirm(t('delete_site_confirm'))) return;
    try {
      await fetch(`/api/sites/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // Deployment Orchestration
  // ----------------------------------------------------
  const handleDeploySite = async (id) => {
    try {
      // Optimistic update
      setSites(prev => prev.map(s => s.id === id ? { ...s, deploy_status: 'deploying' } : s));

      const res = await fetch(`/api/sites/${id}/deploy`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        alert(`Deployment request failed: ${data.error}`);
      }

      await fetchData();
    } catch (err) {
      alert(`Error triggering deploy: ${err.message}`);
    }
  };

  // ----------------------------------------------------
  // Logs Polling Viewer
  // ----------------------------------------------------
  const openLogs = (site) => {
    setActiveSiteForLogs(site);
    setShowLogsModal(true);
    setDeployLogs([]);

    const fetchLogs = () => {
      fetch(`/api/sites/${site.id}/logs`)
        .then(res => res.json())
        .then(data => {
          if (data.logs) setDeployLogs(data.logs);
        })
        .catch(err => console.error(err));
    };

    fetchLogs();
    const poller = setInterval(fetchLogs, 3000);
    setLogsPolling(poller);
  };

  const closeLogs = () => {
    if (logsPolling) clearInterval(logsPolling);
    setLogsPolling(null);
    setActiveSiteForLogs(null);
    setShowLogsModal(false);
  };

  // ----------------------------------------------------
  // Product Database Management (Amazon ASIN Scraper)
  // ----------------------------------------------------
  const openProductsManager = async (site) => {
    setActiveSiteForProducts(site);
    setShowProductsModal(true);
    setSiteProducts([]);
    setImportAsin('');
    setImportDomain('amazon.com');
    setImportLanguage('en_US');
    setImportZipcode('');
    setImportProgress('');
    setImportVisualize('no');
    setCrawledPreview(null);
    
    await fetchSiteProducts(site.id);
  };

  const fetchSiteProducts = async (siteId) => {
    setProductsLoading(true);
    setSelectedProductIds([]);
    try {
      const res = await fetch(`/api/sites/${siteId}/products`);
      if (res.ok) {
        const data = await res.json();
        setSiteProducts(data);
      } else {
        console.error('Failed to load site products');
      }
    } catch (err) {
      console.error('Failed to load site products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleImportProduct = async (e) => {
    e.preventDefault();
    if (!importAsin.trim() || !activeSiteForProducts) return;
    setImportLoading(true);
    setCrawledPreview(null);
    setCrawlingLogs([]);
    
    const addLog = (msg) => {
      const timeStr = new Date().toLocaleTimeString();
      setCrawlingLogs(prev => [...prev, `[${timeStr}] ${msg}`]);
    };

    const startTime = Date.now();
    addLog(lang === 'zh' ? `开始导入流程。输入 ASIN 列表。发布直接上架: ${publishDirectly ? '是' : '否 (草稿)'}` : `Start import process. Publish immediately: ${publishDirectly ? 'Yes' : 'No (Draft)'}`);
    
    try {
      const isLocalScraper = sysSettings.amazon_scraper_type === 'local';
      
      if (isLocalScraper) {
        const localScraperUrl = 'http://localhost:3005';
        const asinsArray = importAsin.split(/[\s,;\n\r]+/).map(a => a.trim()).filter(Boolean);
        const crawledProducts = [];
        const failedImports = [];
        
        addLog(lang === 'zh' ? `检测到本地抓取模式。共 ${asinsArray.length} 个商品待抓取。` : `Local scraper mode detected. Total ${asinsArray.length} products to scrape.`);
        
        for (let i = 0; i < asinsArray.length; i++) {
          const asin = asinsArray[i];
          const itemStartTime = Date.now();
          setImportProgress(lang === 'zh' ? `正在本地浏览器抓取 ASIN (${i + 1}/${asinsArray.length}): ${asin}...` : `Scraping ASIN locally (${i + 1}/${asinsArray.length}): ${asin}...`);
          addLog(lang === 'zh' ? `[${i + 1}/${asinsArray.length}] 正在抓取 ASIN: ${asin}...` : `[${i + 1}/${asinsArray.length}] Scraping ASIN: ${asin}...`);
          
          try {
            const localRes = await fetch(`${localScraperUrl}/scrape`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                asin,
                domain: importDomain,
                language: importLanguage,
                zipcode: importZipcode,
                headless: importVisualize !== 'yes'
              })
            });
            
            const productData = await localRes.json();
            if (!localRes.ok) {
              throw new Error(productData.error || (lang === 'zh' ? '未知抓取错误' : 'Unknown scraping error'));
            }
            
            const itemTime = ((Date.now() - itemStartTime) / 1000).toFixed(1);
            addLog(lang === 'zh' 
              ? `ASIN ${asin} 抓取成功。标题: "${productData.title.slice(0, 30)}...", 价格: $${productData.price}, 图片数: ${productData.gallery ? JSON.parse(productData.gallery).length : 1}。耗时: ${itemTime} 秒。` 
              : `ASIN ${asin} scraped successfully. Title: "${productData.title.slice(0, 30)}...", Price: $${productData.price}. Time: ${itemTime}s.`);
            
            crawledProducts.push(productData);
            setCrawledPreview(productData);
          } catch (localErr) {
            const itemTime = ((Date.now() - itemStartTime) / 1000).toFixed(1);
            addLog(lang === 'zh' 
              ? `❌ ASIN ${asin} 抓取失败: ${localErr.message}。耗时: ${itemTime} 秒。` 
              : `❌ ASIN ${asin} failed: ${localErr.message}. Time: ${itemTime}s.`);
            console.error(`Local scraper failed for ASIN ${asin}:`, localErr);
            failedImports.push({ asin, error: localErr.message });
          }
        }
        
        if (crawledProducts.length > 0) {
          setImportProgress(lang === 'zh' ? '正在保存抓取的数据...' : 'Saving crawled products...');
          addLog(lang === 'zh' ? `正在上传 ${crawledProducts.length} 个成功抓取的商品数据到 D1 数据库...` : `Uploading ${crawledProducts.length} products to database...`);
          
          const res = await fetch(`/api/sites/${activeSiteForProducts.id}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              products: crawledProducts,
              publishDirectly
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to save products');
          
          const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
          addLog(lang === 'zh' ? `🎉 保存成功！全部流程结束。总耗时: ${totalTime} 秒。` : `🎉 Success! Total elapsed time: ${totalTime}s.`);
          
          let alertMsg = '';
          if (failedImports.length > 0) {
            const failedList = failedImports.map(f => `${f.asin} (${f.error})`).join('\n');
            alertMsg = lang === 'zh' 
              ? `成功抓取并导入了 ${crawledProducts.length} 个商品！\n\n以下 ${failedImports.length} 个 ASIN 抓取失败：\n${failedList}`
              : `Imported ${crawledProducts.length} products successfully!\n\nFailed to import ${failedImports.length} ASINs:\n${failedList}`;
          } else {
            alertMsg = data.message || (lang === 'zh' ? '所有商品已成功抓取并导入！' : 'All products successfully imported!');
          }
          
          alert(alertMsg);
          setImportAsin('');
          await fetchSiteProducts(activeSiteForProducts.id);
        } else {
          // If all failed
          const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
          addLog(lang === 'zh' ? `❌ 全部商品抓取均失败。总耗时: ${totalTime} 秒。` : `❌ All products failed. Total time: ${totalTime}s.`);
          const failedList = failedImports.map(f => `${f.asin} (${f.error})`).join('\n');
          throw new Error(
            lang === 'zh'
              ? `所有商品抓取均失败。请确保已在终端运行 npm run local-scraper 启动抓取助手。\n\n详细错误如下：\n${failedList}`
              : `Failed to import any products. Details:\n${failedList}`
          );
        }
      } else {
        setImportProgress(lang === 'zh' ? '正在连接云端队列并进行商品抓取...' : 'Crawling and importing amazon products...');
        addLog(lang === 'zh' ? `检测到云端抓取模式。发送 ASIN 列表到后台处理器...` : `Cloud scraper mode detected. Sending ASINs to backend...`);
        
        const res = await fetch(`/api/sites/${activeSiteForProducts.id}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asins: importAsin.trim(),
            domain: importDomain,
            language: importLanguage,
            zipcode: importZipcode,
            visualize: importVisualize === 'yes',
            publishDirectly
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to import products');
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        addLog(lang === 'zh' ? `🎉 抓取保存成功！总耗时: ${totalTime} 秒。` : `🎉 Success! Total elapsed time: ${totalTime}s.`);
        
        if (data.results && data.results.length > 0) {
          const lastSuccess = [...data.results].reverse().find(r => r.success);
          if (lastSuccess) {
            setCrawledPreview(lastSuccess);
          }
        }
        
        alert(data.message || (lang === 'zh' ? '商品抓取并导入完成！' : 'Products successfully imported!'));
        setImportAsin('');
        await fetchSiteProducts(activeSiteForProducts.id);
      }
    } catch (err) {
      addLog(`❌ 出错: ${err.message}`);
      alert(err.message);
    } finally {
      setImportLoading(false);
      setImportProgress('');
    }
  };

  const handleBatchStatusProducts = async (isActive, isFeatured) => {
    if (selectedProductIds.length === 0) return;
    if (!activeSiteForProducts) return;
    setImportLoading(true);
    
    let progressMsg = '';
    if (isActive !== undefined) {
      progressMsg = isActive 
        ? (lang === 'zh' ? '正在批量上架所选商品...' : 'Publishing selected products in batch...')
        : (lang === 'zh' ? '正在批量下架所选商品...' : 'Unpublishing selected products in batch...');
    } else {
      progressMsg = isFeatured
        ? (lang === 'zh' ? '正在批量设置首页推荐...' : 'Setting featured products in batch...')
        : (lang === 'zh' ? '正在批量取消首页推荐...' : 'Removing featured products in batch...');
    }
    
    setImportProgress(progressMsg);
    try {
      const bodyPayload = { productIds: selectedProductIds };
      if (isActive !== undefined) bodyPayload.isActive = isActive;
      if (isFeatured !== undefined) bodyPayload.isFeatured = isFeatured;

      const res = await fetch(`/api/sites/${activeSiteForProducts.id}/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update products status');
      setSelectedProductIds([]);
      await fetchSiteProducts(activeSiteForProducts.id);
      alert(data.message || (lang === 'zh' ? '操作成功！' : 'Status updated successfully!'));
    } catch (err) {
      alert(err.message);
    } finally {
      setImportLoading(false);
      setImportProgress('');
    }
  };

  const handleToggleProductActive = async (productId, currentStatus) => {
    if (!activeSiteForProducts) return;
    try {
      const res = await fetch(`/api/sites/${activeSiteForProducts.id}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: currentStatus ? 0 : 1 })
      });
      if (!res.ok) throw new Error('Failed to update product status');
      await fetchSiteProducts(activeSiteForProducts.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm(lang === 'zh' ? '确定要从网站删除该商品吗？' : 'Are you sure you want to delete this product?')) {
      return;
    }
    if (!activeSiteForProducts) return;
    try {
      const res = await fetch(`/api/sites/${activeSiteForProducts.id}/products/${productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await fetchSiteProducts(activeSiteForProducts.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === siteProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(siteProducts.map(p => p.id));
    }
  };

  const handleBatchDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(lang === 'zh' ? `确定要从网站批量删除所选的 ${selectedProductIds.length} 个商品吗？` : `Are you sure you want to delete the selected ${selectedProductIds.length} products?`)) {
      return;
    }
    if (!activeSiteForProducts) return;
    setImportLoading(true);
    setImportProgress(lang === 'zh' ? '正在批量删除选中的商品...' : 'Deleting selected products in batch...');
    try {
      const res = await fetch(`/api/sites/${activeSiteForProducts.id}/products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProductIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to batch delete products');
      setSelectedProductIds([]);
      await fetchSiteProducts(activeSiteForProducts.id);
      alert(data.message || (lang === 'zh' ? '批量删除成功！' : 'Batch deleted successfully!'));
    } catch (err) {
      alert(err.message);
    } finally {
      setImportLoading(false);
      setImportProgress('');
    }
  };

  // ----------------------------------------------------
  // Save Settings
  // ----------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sysSettings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert(lang === 'zh' ? '全局配置更新成功！' : 'Settings updated successfully!');
      // Clear password field to avoid reuse
      setSysSettings(prev => ({ ...prev, admin_password: '' }));
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
          <p className="text-sm text-text-muted">{t('loading_panel')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-blue-600/30 transition-colors duration-300">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar-bg flex flex-col shrink-0 transition-colors duration-300">
        <div className="p-6 border-b border-sidebar-border flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-logo-from to-logo-to flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-text-heading to-text-muted bg-clip-text text-transparent">
              SitesPro
            </h1>
            <span className="text-[10px] text-text-muted font-semibold tracking-wider uppercase">
              {t('control_panel')}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('sites')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'sites'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-text-muted hover:text-text-heading hover:bg-slate-500/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            {t('manage_sites')}
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-text-muted">
              {sites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'accounts'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-text-muted hover:text-text-heading hover:bg-slate-500/10'
            }`}
          >
            <Key className="w-4 h-4" />
            {t('cf_credentials')}
          </button>

          <button
            onClick={() => {
              setActiveTab('keywords');
              setSelectedKeywords([]);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'keywords'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-text-muted hover:text-text-heading hover:bg-slate-500/10'
            }`}
          >
            <Search className="w-4 h-4" />
            {t('keyword_analysis')}
          </button>

          <button
            onClick={() => {
              setActiveTab('keywords_mgr');
              fetchSavedKeywords();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'keywords_mgr'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-text-muted hover:text-text-heading hover:bg-slate-500/10'
            }`}
          >
            <Database className="w-4 h-4" />
            {lang === 'zh' ? '关键词管理' : 'Keyword DB'}
          </button>

          <button
            onClick={() => setActiveTab('asin_search')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'asin_search'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-text-muted hover:text-text-heading hover:bg-slate-500/10'
            }`}
          >
            <Tag className="w-4 h-4" />
            {lang === 'zh' ? 'ASIN 采集' : 'ASIN Fetcher'}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-text-muted hover:text-text-heading hover:bg-slate-500/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            {t('sys_settings')}
          </button>
        </nav>

        <div className="p-4 border-t border-sidebar-border flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleLang}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-slate-500/10 text-xs font-semibold text-text-muted hover:text-text-heading transition-colors cursor-pointer"
              title="切换语言 / Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'zh' ? 'EN' : '中文'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-slate-500/10 text-text-muted hover:text-text-heading transition-colors cursor-pointer"
              title="切换皮肤 / Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* 2. Main Workstation Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8">
        {/* Header Stats bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-heading capitalize">
              {activeTab === 'sites'
                ? t('websites_generator')
                : activeTab === 'accounts'
                ? t('cloudflare_accounts')
                : activeTab === 'keywords'
                ? t('keyword_analysis')
                : activeTab === 'keywords_mgr'
                ? (lang === 'zh' ? '关键词管理' : 'Keyword Database')
                : activeTab === 'asin_search'
                ? (lang === 'zh' ? 'Amazon ASIN 采集助手' : 'Amazon ASIN Bulk Extractor')
                : t('platform_config')}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {activeTab === 'sites'
                ? t('desc_sites')
                : activeTab === 'accounts'
                ? t('desc_accounts')
                : activeTab === 'keywords'
                ? t('desc_keywords')
                : activeTab === 'keywords_mgr'
                ? (lang === 'zh' ? '查看与管理已存入关键词数据库的数据，检测关键词与独立站标识的匹配/使用状态。' : 'Manage saved keywords in the database and monitor usage status with site keys.')
                : activeTab === 'asin_search'
                ? (lang === 'zh' ? '输入 Amazon 搜索关键词，批量采集并提取前 100 个商品的 ASIN、主图与标题信息。' : 'Search Amazon keywords to bulk extract ASINs, main images, and titles for top 100 products.')
                : t('desc_settings')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-slate-500/10 text-text-muted hover:text-text-heading transition-colors cursor-pointer"
              title={t('refresh')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === 'sites' && (
              <button
                onClick={() => {
                  if (accounts.length === 0) {
                    alert(t('account_required'));
                    return;
                  }
                  setShowSiteModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t('build_site')}
              </button>
            )}

            {activeTab === 'accounts' && (
              <button
                onClick={() => setShowAccountModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t('add_account')}
              </button>
            )}
          </div>
        </div>

        {/* 3. Tab: SITES LIST */}
        {activeTab === 'sites' && (
          <div className="space-y-6">
            {sites.length === 0 ? (
              <div className="border border-dashed border-card-border rounded-3xl p-12 text-center text-text-muted space-y-3">
                <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <h3 className="font-semibold text-text-heading">{t('no_sites')}</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {t('no_sites_desc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {sites.map(site => (
                  <div
                    key={site.id}
                    className="bg-card-bg border border-card-border rounded-3xl p-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-text-heading tracking-tight flex items-center gap-2">
                            {site.domain || `${site.pages_project_name || site.name}.pages.dev`}
                            <a
                              href={`https://${site.domain || `${site.pages_project_name || site.name}.pages.dev`}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-text-muted hover:text-text-heading transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </h3>
                          <span className="text-xs text-text-muted mt-1 block">
                            {t('key')}: <code className="text-text-heading font-semibold">{site.name}</code> | CF: <code className="text-text-heading font-semibold">{site.cf_account_name || 'Unknown'}</code>
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {site.deploy_status === 'deploying' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              {t('status_building')}
                            </span>
                          ) : site.deploy_status === 'success' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t('status_active')}
                            </span>
                          ) : site.deploy_status === 'failed' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              <XCircle className="w-3.5 h-3.5" />
                              {t('status_failed')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-text-muted border border-card-border">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {t('status_pending')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SEO Preview */}
                      <div className="mt-4 p-4 rounded-2xl bg-accent-bg border border-card-border text-xs space-y-1">
                        <p className="font-semibold text-text-heading truncate">{site.seo_title}</p>
                        <p className="text-text-muted line-clamp-2 leading-relaxed">{site.seo_description}</p>
                      </div>

                      {/* Configurations summary */}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <Database className="w-3.5 h-3.5 text-text-muted" />
                          <span>{t('d1_bound')}:</span>
                          <span className="text-text-heading font-semibold truncate max-w-[120px]" title={site.d1_database_id}>
                            {site.d1_database_id ? site.d1_database_id.slice(0, 8) + '...' : 'None'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <Mail className="w-3.5 h-3.5 text-text-muted" />
                          <span>{t('mail_routing')}:</span>
                          <span className="text-text-heading font-semibold">{(site.domain && site.email_forwarding === 1) ? t('status_active') : t('close')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted">{t('colors')}:</span>
                          <div className="flex gap-1">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-inner"
                              style={{ backgroundColor: site.primary_color }}
                              title="Primary color"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-inner"
                              style={{ backgroundColor: site.accent_color }}
                              title="Accent color"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeploySite(site.id)}
                          disabled={site.deploy_status === 'deploying'}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white text-xs font-semibold border border-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {t('deploy')}
                        </button>
                        <button
                          onClick={() => openLogs(site)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-heading text-xs font-semibold border border-card-border transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-text-muted" />
                          {t('logs')}
                        </button>
                        <button
                          onClick={() => openProductsManager(site)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-heading text-xs font-semibold border border-card-border transition-all cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5 text-blue-500" />
                          {lang === 'zh' ? '商品管理' : 'Products'}
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditSite(site)}
                          disabled={site.deploy_status === 'deploying'}
                          className="p-2 rounded-xl text-text-muted hover:text-text-heading hover:bg-slate-500/10 transition-colors cursor-pointer"
                          title={lang === 'zh' ? '修改配置' : 'Edit Configuration'}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSite(site.id)}
                          disabled={site.deploy_status === 'deploying'}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Tab: ACCOUNTS (Cloudflare credentials) */}
        {activeTab === 'accounts' && (
          <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl">
            {accounts.length === 0 ? (
              <div className="p-12 text-center text-text-muted space-y-3">
                <Key className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <h3 className="font-semibold text-text-heading">{t('no_accounts')}</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {t('no_accounts_desc')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-card-border bg-slate-100 dark:bg-slate-900/60 text-text-muted text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">{t('cf_identifier')}</th>
                      <th className="px-6 py-4 font-semibold">{t('cf_account_id')}</th>
                      <th className="px-6 py-4 font-semibold">{t('cf_token')}</th>
                      <th className="px-6 py-4 font-semibold text-right">{t('delete')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-sm text-text-heading">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="px-6 py-4 font-semibold">{acc.name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-text-muted">{acc.account_id}</td>
                        <td className="px-6 py-4 text-text-muted font-mono text-xs">••••••••••••••••••••••••</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Tab: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h3 className="font-semibold text-base text-text-heading">{t('github_creds')}</h3>
                <p className="text-xs text-text-muted mt-1">{t('github_creds_desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">{t('github_owner')}</label>
                    <input
                      type="text"
                      value={sysSettings.github_owner}
                      onChange={e => setSysSettings(prev => ({ ...prev, github_owner: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">{t('github_repo')}</label>
                    <input
                      type="text"
                      value={sysSettings.github_repo}
                      onChange={e => setSysSettings(prev => ({ ...prev, github_repo: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('github_pat')}</label>
                  <input
                    type="password"
                    value={sysSettings.github_token}
                    onChange={e => setSysSettings(prev => ({ ...prev, github_token: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-card-border pt-6">
                <h3 className="font-semibold text-base text-text-heading">{t('default_routing')}</h3>
                <p className="text-xs text-text-muted mt-1">{t('default_routing_desc')}</p>
                <div className="space-y-2 mt-4">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('forward_email')}</label>
                  <input
                    type="email"
                    value={sysSettings.default_forward_email}
                    onChange={e => setSysSettings(prev => ({ ...prev, default_forward_email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  />
                </div>
              </div>

              <div className="border-t border-card-border pt-6">
                <h3 className="font-semibold text-base text-text-heading">{t('bing_api_key_setting')}</h3>
                <p className="text-xs text-text-muted mt-1">{t('bing_api_key_desc')}</p>
                <div className="space-y-2 mt-4">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('bing_api_key_setting')}</label>
                  <input
                    type="password"
                    value={sysSettings.bing_api_key}
                    onChange={e => setSysSettings(prev => ({ ...prev, bing_api_key: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-card-border pt-6">
                <h3 className="font-semibold text-base text-text-heading">{lang === 'zh' ? '亚马逊商品抓取配置' : 'Amazon Scraper Settings'}</h3>
                <p className="text-xs text-text-muted mt-1">{lang === 'zh' ? '配置抓取 Amazon 数据的抓取渠道及 API 密钥。' : 'Configure scraper channel and API key for Amazon ASIN import.'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">{lang === 'zh' ? '抓取渠道' : 'Scraper Channel'}</label>
                    <select
                      value={sysSettings.amazon_scraper_type || 'direct'}
                      onChange={e => setSysSettings(prev => ({ ...prev, amazon_scraper_type: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading cursor-pointer"
                    >
                      <option value="direct">{lang === 'zh' ? '网页直连抓取 (直接请求亚马逊 - 无需 Key)' : 'Direct Web Scraping (No Key)'}</option>
                      <option value="local">{lang === 'zh' ? '本地浏览器抓取 (通过本地运行的抓取助手 - 需启动服务)' : 'Local Browser Scraping (Via helper service)'}</option>
                      <option value="rainforest">Rainforest API (真实无头浏览器与代理池)</option>
                      <option value="scraperapi">ScraperAPI (1000次免费额度 - 稳定代理通道)</option>
                      <option value="crawlbase">Crawlbase / ProxyCrawl (1000次免费额度 - 稳定代理通道)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">{lang === 'zh' ? 'API 密钥' : 'API Key'}</label>
                    <input
                      type="password"
                      placeholder="API Key / Token"
                      value={sysSettings.amazon_scraper_key || ''}
                      onChange={e => setSysSettings(prev => ({ ...prev, amazon_scraper_key: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-card-border pt-6">
                <h3 className="font-semibold text-base text-text-heading">{t('update_passcode')}</h3>
                <p className="text-xs text-text-muted mt-1">{t('update_passcode_desc')}</p>
                <div className="space-y-2 mt-4">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('new_passcode')}</label>
                  <input
                    type="password"
                    placeholder="Enter new passcode to update (or leave empty)"
                    value={sysSettings.admin_password}
                    onChange={e => setSysSettings(prev => ({ ...prev, admin_password: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save_settings')}
              </button>
            </form>
          </div>
        )}

        {/* 6. Tab: KEYWORDS ANALYSIS */}
        {activeTab === 'keywords' && (
          <div className="space-y-6 animate-fade-in w-full">
            <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl w-full">
              <form onSubmit={handleAnalyzeKeyword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-semibold uppercase">核心关键词 (Core Keyword)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. fashion cashback deals"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">国家 (Country)</label>
                    <select
                      value={keywordCountry}
                      onChange={e => setKeywordCountry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading cursor-pointer"
                    >
                      {BING_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">语言 (Language)</label>
                    <select
                      value={keywordLanguage}
                      onChange={e => setKeywordLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading cursor-pointer"
                    >
                      {BING_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>
                          {l.name} ({l.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">设备类型 (Device)</label>
                    <select
                      value={keywordDevice}
                      onChange={e => setKeywordDevice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading cursor-pointer"
                    >
                      <option value="all">全部设备 (All)</option>
                      <option value="web">电脑端 (Web)</option>
                      <option value="mobile">移动端 (Mobile)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">日期范围 (Date Range)</label>
                    <select
                      value={keywordPeriod}
                      onChange={e => setKeywordPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading cursor-pointer"
                    >
                      <option value="30d">30 D (近30天)</option>
                      <option value="3m">3 M (近3个月)</option>
                      <option value="6m">6 M (近6个月)</option>
                      <option value="12m">12 M (近12个月)</option>
                      <option value="18m">18 M (近18个月)</option>
                      <option value="24m">24 M (近24个月)</option>
                      <option value="custom">Custom (自定义区间)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-text-muted font-semibold uppercase">保留门槛 (Threshold)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={keywordThreshold}
                      onChange={e => setKeywordThreshold(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                </div>

                {keywordPeriod === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-500/5 rounded-2xl border border-card-border animate-fade-in">
                    <div className="space-y-2">
                      <label className="text-xs text-text-muted font-semibold uppercase">开始日期 (Start Date)</label>
                      <input
                        type="date"
                        required
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-text-muted font-semibold uppercase">结束日期 (End Date)</label>
                      <input
                        type="date"
                        required
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={analyzeLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {analyzeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在评估关键词展现量...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      分析关键词
                    </>
                  )}
                </button>
              </form>
            </div>

            {analyzeError && (
              <div className="max-w-2xl p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>分析失败: {analyzeError}</span>
              </div>
            )}

            {analyzeResult && (
              <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl animate-fade-in-up">
                <div className="p-6 border-b border-card-border bg-slate-100/50 dark:bg-slate-900/40">
                  <h3 className="font-bold text-lg text-text-heading flex flex-wrap items-center gap-2">
                    分析结果: &ldquo;{analyzeResult.keyword}&rdquo;
                    {analyzeResult.passed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        符合保留要求 (展现量: {analyzeResult.impressions} &gt; {analyzeResult.threshold})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        不符合保留要求 (展现量: {analyzeResult.impressions} &le; {analyzeResult.threshold})
                      </span>
                    )}
                  </h3>
                  {analyzeResult.device !== 'all' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      注：设备维度展现量为系统根据 API 汇总数值进行估算（电脑端按 70%、移动端按 30%）。
                    </p>
                  )}
                  {['12m', '18m', '24m'].includes(analyzeResult.period) && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      注：Bing API 最多返回近 6 个月历史记录，计算展现量采用当前可用记录的最大汇总值。
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 text-xs">
                    <p className="text-text-muted">
                      统计区间: <span className="font-mono text-text-heading">{analyzeResult.queryStartDate}</span> 至 <span className="font-mono text-text-heading">{analyzeResult.queryEndDate}</span> | 
                      共获取到 {analyzeResult.related ? analyzeResult.related.length : 0} 个 Bing Webmaster 推荐的相关词
                    </p>
                    <label className="inline-flex items-center gap-2 text-text-heading font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFilteredKeywords}
                        onChange={e => setShowFilteredKeywords(e.target.checked)}
                        className="rounded border-card-border text-blue-600 focus:ring-blue-500"
                      />
                      显示过滤掉的词 (&le; {analyzeResult.threshold} 展现)
                    </label>
                  </div>

                  {/* Batch Save Action Banner */}
                  {(() => {
                    const allRelated = [
                      { keyword: analyzeResult.keyword, impressions: analyzeResult.impressions, passed: analyzeResult.passed },
                      ...(analyzeResult.related || [])
                    ];
                    const visibleKeywords = allRelated.filter(item => showFilteredKeywords || item.passed);
                    return selectedKeywords.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          已选择 {selectedKeywords.length} 个关键词
                        </span>
                        <button
                          onClick={handleBatchSaveKeywords}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/10"
                        >
                          <Database className="w-3.5 h-3.5" />
                          批量保存到数据库
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-card-border bg-slate-100 dark:bg-slate-900/60 text-text-muted text-xs uppercase tracking-wider">
                        <th className="px-4 py-4 w-12 text-center">
                          {(() => {
                            const allRelated = [
                              { keyword: analyzeResult.keyword, impressions: analyzeResult.impressions, passed: analyzeResult.passed },
                              ...(analyzeResult.related || [])
                            ];
                            const visibleKeywords = allRelated.filter(item => showFilteredKeywords || item.passed);
                            return (
                              <input
                                type="checkbox"
                                checked={visibleKeywords.length > 0 && selectedKeywords.length === visibleKeywords.length}
                                onChange={handleToggleSelectAll}
                                className="rounded border-card-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            );
                          })()}
                        </th>
                        <th className="px-6 py-4 font-semibold">关键词 (Query)</th>
                        <th className="px-6 py-4 font-semibold">预估展现量 (Impressions)</th>
                        <th className="px-6 py-4 font-semibold">数据来源 (Source)</th>
                        <th className="px-6 py-4 font-semibold">状态 (Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border text-sm text-text-heading">
                      {/* Specified Keyword */}
                      <tr className="hover:bg-slate-500/5 transition-colors font-bold bg-blue-500/5">
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedKeywords.includes(analyzeResult.keyword)}
                            onChange={() => handleToggleSelectOne(analyzeResult.keyword)}
                            className="rounded border-card-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">{analyzeResult.keyword}</td>
                        <td className="px-6 py-4 font-mono">{analyzeResult.impressions}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded text-xs font-semibold">
                            查询主词 (Stats)
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {analyzeResult.passed ? (
                            <span className="text-green-500 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> 保留
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> 过滤
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Related Keywords */}
                      {(analyzeResult.related || [])
                        .filter(item => showFilteredKeywords || item.passed)
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                            <td className="px-4 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedKeywords.includes(item.keyword)}
                                onChange={() => handleToggleSelectOne(item.keyword)}
                                className="rounded border-card-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 font-medium">{item.keyword}</td>
                            <td className="px-6 py-4 font-mono">{item.impressions}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-text-muted border border-card-border rounded text-xs">
                                推荐相关词 (Related)
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {item.passed ? (
                                <span className="text-green-500 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> 保留
                                </span>
                              ) : (
                                <span className="text-red-500/70 flex items-center gap-1">
                                  <XCircle className="w-4 h-4" /> 过滤
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Tab: KEYWORDS MANAGEMENT */}
        {activeTab === 'keywords_mgr' && (
          <div className="space-y-6 animate-fade-in w-full">

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card-bg border border-card-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-heading">{savedKeywords.length}</div>
                  <div className="text-xs text-text-muted font-medium">总词数 (Total)</div>
                </div>
              </div>

              <div className="bg-card-bg border border-card-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-heading">
                    {savedKeywords.filter(k => k.usage_count > 0).length}
                  </div>
                  <div className="text-xs text-text-muted font-medium">已使用 (Used)</div>
                </div>
              </div>

              <div className="bg-card-bg border border-card-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-text-muted flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-heading">
                    {savedKeywords.filter(k => !k.usage_count).length}
                  </div>
                  <div className="text-xs text-text-muted font-medium">未使用 (Unused)</div>
                </div>
              </div>
            </div>

            {/* Keyword database list */}
            <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="搜索已保存的关键词..."
                    value={keywordsSearchQuery}
                    onChange={e => setKeywordsSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  />
                </div>
                <button
                  onClick={fetchSavedKeywords}
                  className="px-4 py-2.5 bg-slate-500/10 hover:bg-slate-500/20 active:scale-[0.98] transition-all rounded-xl text-sm font-semibold text-text-heading flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${keywordsLoading ? 'animate-spin' : ''}`} />
                  刷新数据
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-card-border bg-slate-100 dark:bg-slate-900/60 text-text-muted text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">关键词 (Keyword)</th>
                      <th className="px-6 py-4 font-semibold">历史预估展现 (Impressions)</th>
                      <th className="px-6 py-4 font-semibold">存入日期 (Save Date)</th>
                      <th className="px-6 py-4 font-semibold">使用状态 (Status)</th>
                      <th className="px-6 py-4 font-semibold text-right">操作 (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-sm text-text-heading">
                    {savedKeywords.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                          数据库中暂无关键词记录，请前往“关键词分析”进行评估并存入。
                        </td>
                      </tr>
                    ) : savedKeywords.filter(k => k.keyword.toLowerCase().includes(keywordsSearchQuery.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                          未找到匹配该搜索内容的关键词。
                        </td>
                      </tr>
                    ) : (
                      savedKeywords
                        .filter(k => k.keyword.toLowerCase().includes(keywordsSearchQuery.toLowerCase()))
                        .map((kw) => (
                          <tr key={kw.id} className="hover:bg-slate-500/5 transition-colors">
                            <td className="px-6 py-4 font-semibold">{kw.keyword}</td>
                            <td className="px-6 py-4 font-mono font-medium">{kw.impressions}</td>
                            <td className="px-6 py-4 text-text-muted font-mono text-xs">
                              {mounted ? new Date(kw.created_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </td>
                            <td className="px-6 py-4">
                              {kw.usage_count > 0 ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                    已使用 ({kw.usage_count})
                                  </span>
                                  <p className="text-[10px] text-text-muted max-w-[200px] truncate" title={kw.site_domains}>
                                    关联域名: {kw.site_domains}
                                  </p>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-text-muted border border-card-border">
                                  未使用
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteKeyword(kw.id)}
                                className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. Tab: AMAZON ASIN SEARCH & EXTRACTION */}
        {activeTab === 'asin_search' && (
          <div className="space-y-6 animate-fade-in w-full">
            {/* Toast Notice */}
            {copiedToast && (
              <div className="fixed top-6 right-6 z-50 bg-green-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{copiedToast}</span>
              </div>
            )}

            {/* 1. Search Box Card */}
            <div className="bg-card-bg border border-card-border p-6 rounded-3xl shadow-sm space-y-5">
              <form onSubmit={handleSearchAmazonAsins} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      placeholder={lang === 'zh' ? '输入 Amazon 搜索关键词，例如: luxury fashion coat' : 'Enter Amazon search query, e.g. luxury fashion coat'}
                      value={asinSearchQuery}
                      onChange={e => setAsinSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-10 py-3 bg-input-bg border border-input-border rounded-2xl focus:border-blue-500 outline-none text-sm text-text-heading font-medium"
                      required
                    />
                    {asinSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAsinSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={asinSearchLoading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 shrink-0"
                  >
                    {asinSearchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'zh' ? '正在抓取 ASIN...' : 'Searching...'}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{lang === 'zh' ? '获取商品 ASIN' : 'Fetch ASINs'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Filter Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Country / Domain */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-bold uppercase block">
                      {lang === 'zh' ? '国家 / Amazon 域名' : 'Country / Domain'}
                    </label>
                    <div className="relative">
                      <select
                        value={asinSearchDomain}
                        onChange={e => setAsinSearchDomain(e.target.value)}
                        disabled={asinSearchLoading}
                        className="w-full pl-3 pr-8 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading cursor-pointer h-10 appearance-none font-medium"
                      >
                        <option value="amazon.com">amazon.com (US)</option>
                        <option value="amazon.co.uk">amazon.co.uk (UK)</option>
                        <option value="amazon.de">amazon.de (DE)</option>
                        <option value="amazon.co.jp">amazon.co.jp (JP)</option>
                        <option value="amazon.ca">amazon.ca (CA)</option>
                        <option value="amazon.fr">amazon.fr (FR)</option>
                        <option value="amazon.it">amazon.it (IT)</option>
                        <option value="amazon.es">amazon.es (ES)</option>
                        <option value="amazon.com.au">amazon.com.au (AU)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-bold uppercase block">
                      {lang === 'zh' ? '搜索抓取语言' : 'Search Language'}
                    </label>
                    <div className="relative">
                      <select
                        value={asinSearchLanguage}
                        onChange={e => setAsinSearchLanguage(e.target.value)}
                        disabled={asinSearchLoading}
                        className="w-full pl-3 pr-8 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading cursor-pointer h-10 appearance-none font-medium"
                      >
                        <option value="en_US">en_US (English)</option>
                        <option value="zh_CN">zh_CN (中文)</option>
                        <option value="es_US">es_US (Spanish)</option>
                        <option value="de_DE">de_DE (German)</option>
                        <option value="fr_FR">fr_FR (French)</option>
                        <option value="it_IT">it_IT (Italian)</option>
                        <option value="ja_JP">ja_JP (Japanese)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Count Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-bold uppercase block">
                      {lang === 'zh' ? '获取结果数量' : 'Result Count Limit'}
                    </label>
                    <div className="relative">
                      <select
                        value={asinSearchLimit}
                        onChange={e => setAsinSearchLimit(Number(e.target.value))}
                        disabled={asinSearchLoading}
                        className="w-full pl-3 pr-8 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading cursor-pointer h-10 appearance-none font-medium"
                      >
                        <option value={100}>{lang === 'zh' ? '前 100 条 (默认推荐)' : 'Top 100 items (Recommended)'}</option>
                        <option value={50}>{lang === 'zh' ? '前 50 条' : 'Top 50 items'}</option>
                        <option value={20}>{lang === 'zh' ? '前 20 条' : 'Top 20 items'}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Error Banner if any */}
            {asinSearchError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{asinSearchError}</span>
              </div>
            )}

            {/* 2. Results Header Action Bar */}
            {asinSearchResults.length > 0 && (
              <div className="bg-card-bg border border-card-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-heading select-none">
                    <input
                      type="checkbox"
                      checked={selectedAsins.length > 0 && selectedAsins.length === asinSearchResults.length}
                      onChange={handleToggleSelectAllAsins}
                      className="w-4 h-4 rounded border-input-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{lang === 'zh' ? `全选 (共 ${asinSearchResults.length} 个)` : `Select All (${asinSearchResults.length} items)`}</span>
                  </label>

                  <span className="text-xs text-text-muted">
                    {lang === 'zh' ? `已勾选 ` : `Selected `}
                    <strong className="text-blue-600 dark:text-blue-400">{selectedAsins.length}</strong>
                    {lang === 'zh' ? ` 项` : ` items`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Format Selector */}
                  <div className="flex items-center bg-input-bg border border-input-border rounded-xl p-0.5 text-xs">
                    <button
                      onClick={() => setCopyFormat('newline')}
                      className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${copyFormat === 'newline' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                    >
                      {lang === 'zh' ? '换行分隔' : 'Newline'}
                    </button>
                    <button
                      onClick={() => setCopyFormat('comma')}
                      className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${copyFormat === 'comma' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                    >
                      {lang === 'zh' ? '逗号分隔' : 'Comma'}
                    </button>
                  </div>

                  {/* Copy Selected ASINs */}
                  <button
                    onClick={() => handleCopyAsins()}
                    disabled={selectedAsins.length === 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? `复制已选 ASIN (${selectedAsins.length})` : `Copy Selected (${selectedAsins.length})`}</span>
                  </button>

                  {/* Copy All ASINs */}
                  <button
                    onClick={() => handleCopyAsins(asinSearchResults.map(r => r.asin))}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-heading text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? `复制全部 ${asinSearchResults.length} 个 ASIN` : `Copy All (${asinSearchResults.length})`}</span>
                  </button>

                  {/* One-click Import to Site */}
                  {sites.length > 0 && (
                    <button
                      onClick={() => setShowImportToSiteModal(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '一键导入到独立站' : 'Import to Site'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Results List View (Matches User Image 2) */}
            {asinSearchResults.length > 0 && (
              <div className="space-y-3">
                {asinSearchResults.map((item, idx) => {
                  const isSelected = selectedAsins.includes(item.asin);
                  return (
                    <div
                      key={item.asin + '-' + idx}
                      className={`bg-card-bg border rounded-2xl p-4 transition-all duration-200 flex items-start gap-4 hover:shadow-md ${
                        isSelected ? 'border-blue-500/80 bg-blue-500/5' : 'border-card-border hover:border-slate-400/40'
                      }`}
                    >
                      {/* Left Selection Checkbox */}
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOneAsin(item.asin)}
                          className="w-4 h-4 rounded border-input-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Product Thumbnail */}
                      <div className="w-24 h-24 rounded-xl bg-white border border-card-border p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-[10px] text-gray-400">No Image</div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <h4 className="text-sm font-semibold text-text-heading line-clamp-2 leading-snug">
                          {item.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {/* ASIN Pill */}
                          <div className="flex items-center gap-1 bg-slate-500/10 border border-slate-500/20 px-2.5 py-0.5 rounded-lg text-text-heading font-mono text-[11px] font-bold">
                            <span>ASIN: {item.asin}</span>
                            <button
                              onClick={() => handleCopySingleAsin(item.asin)}
                              className="ml-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              title="复制 ASIN"
                            >
                              📋
                            </button>
                          </div>

                          {/* Price */}
                          {item.price && (
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                              {item.price}
                            </span>
                          )}

                          {/* Rating & Reviews */}
                          {item.rating && (
                            <span className="text-amber-500 font-medium text-[11px]">
                              {item.rating} {item.reviews_count ? `(${item.reviews_count})` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Link Button */}
                      <div className="shrink-0 pt-1">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-text-muted hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-500/10 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="在 Amazon 打开"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD CLOUDFLARE ACCOUNT                            */}
      {/* ======================================================== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-card-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-text-heading">{t('add_cf_title')}</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-text-muted hover:text-text-heading cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('add_cf_alias')}</label>
                <input
                  type="text"
                  placeholder="e.g. primary-cf-acc"
                  value={accountForm.name}
                  onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('cf_account_id')}</label>
                <input
                  type="text"
                  placeholder="32 character hash ID"
                  value={accountForm.account_id}
                  onChange={e => setAccountForm(prev => ({ ...prev, account_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('cf_token')}</label>
                <input
                  type="password"
                  placeholder={t('add_cf_token_desc')}
                  value={accountForm.api_token}
                  onChange={e => setAccountForm(prev => ({ ...prev, api_token: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('add_account')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW SITE                                   */}
      {/* ======================================================== */}
      {showSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-card-border rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-card-border/60 shrink-0">
              <h3 className="font-bold text-lg text-text-heading">{t('add_site_title')}</h3>
              <button onClick={() => setShowSiteModal(false)} className="text-text-muted hover:text-text-heading cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddSite} className="flex-1 overflow-y-auto p-6 space-y-6 admin-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-muted font-semibold uppercase">{t('site_key_name')}</label>
                    {savedKeywords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowQuickSelect(!showQuickSelect)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer animate-fade-in"
                      >
                        <Database className="w-2.5 h-2.5" />
                        快速选择
                      </button>
                    )}
                  </div>

                  {showQuickSelect && (
                    <div className="absolute left-0 top-14 z-50 bg-card-bg border border-card-border rounded-2xl shadow-2xl p-4 space-y-3 w-[320px] sm:w-[380px] max-h-60 overflow-y-auto animate-fade-in-up">
                      <div className="text-xs font-bold text-text-muted flex justify-between items-center border-b border-card-border pb-2">
                        <span>选择保存的关键词 ({savedKeywords.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowQuickSelect(false)}
                          className="text-text-muted hover:text-text-heading text-[10px]"
                        >
                          关闭
                        </button>
                      </div>
                      <div className="space-y-1">
                        {savedKeywords.map(kw => (
                          <button
                            key={kw.id}
                            type="button"
                            onClick={() => {
                              setSiteForm(prev => ({ ...prev, name: kw.keyword }));
                              setShowQuickSelect(false);
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs hover:bg-slate-500/10 flex justify-between items-center transition-colors text-text-heading border border-transparent hover:border-blue-500/10 cursor-pointer"
                          >
                            <span className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis mr-3">
                              {kw.keyword}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-mono text-text-muted bg-slate-500/5 px-2 py-0.5 rounded-md">
                                {kw.impressions} 展现
                              </span>
                              {kw.usage_count > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 whitespace-nowrap">
                                  已用
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-text-muted border border-card-border whitespace-nowrap">
                                  未使用
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="e.g. fashion-rebates"
                    value={siteForm.name}
                    onChange={e => setSiteForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('custom_domain_optional')}</label>
                  <input
                    type="text"
                    placeholder="affsitefashion.com"
                    value={siteForm.domain}
                    onChange={e => setSiteForm(prev => ({ ...prev, domain: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('select_account')}</label>
                <select
                  value={siteForm.cf_account_id}
                  onChange={e => setSiteForm(prev => ({ ...prev, cf_account_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  required
                >
                  <option value="">{t('select_account')}</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('primary_color')}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={siteForm.primary_color}
                      onChange={e => setSiteForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 bg-input-bg border border-input-border rounded-xl p-1 outline-none"
                    />
                    <input
                      type="text"
                      value={siteForm.primary_color}
                      onChange={e => setSiteForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1 px-4 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('accent_color')}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={siteForm.accent_color}
                      onChange={e => setSiteForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-12 h-10 bg-input-bg border border-input-border rounded-xl p-1 outline-none"
                    />
                    <input
                      type="text"
                      value={siteForm.accent_color}
                      onChange={e => setSiteForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="flex-1 px-4 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('seo_title')}</label>
                <input
                  type="text"
                  placeholder="e.g. Classic Trench Coat & Fashion Deals | AffSite Store"
                  value={siteForm.seo_title}
                  onChange={e => setSiteForm(prev => ({ ...prev, seo_title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('site_template')}</label>
                <select
                  value={siteForm.template}
                  onChange={e => setSiteForm(prev => ({ ...prev, template: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  required
                >
                  <option value="apparel">{lang === 'zh' ? '服装美妆 (Apparel & Fashion) - 默认' : 'Apparel & Fashion (Default)'}</option>
                  <option value="home">{lang === 'zh' ? '家居生活 (Home & Living)' : 'Home & Living'}</option>
                  <option value="digital">{lang === 'zh' ? '数码3C (Electronics & Digital)' : 'Electronics & Digital'}</option>
                  <option value="services">{lang === 'zh' ? '软件服务 (Services & Subscriptions)' : 'Services & Subscriptions'}</option>
                  <option value="sports">{lang === 'zh' ? '户外运动 (Sports & Outdoors)' : 'Sports & Outdoors'}</option>
                  <option value="beauty">{lang === 'zh' ? '美妆护肤 (Beauty & Skincare)' : 'Beauty & Skincare'}</option>
                  <option value="baby">{lang === 'zh' ? '母婴玩具 (Mother & Baby)' : 'Mother & Baby'}</option>
                  <option value="auto">{lang === 'zh' ? '汽车配件 (Automotive & Accessories)' : 'Automotive & Accessories'}</option>
                  <option value="jewelry">{lang === 'zh' ? '珠宝手表 (Watches & Jewelry)' : 'Watches & Jewelry'}</option>
                  <option value="food">{lang === 'zh' ? '食品饮料 (Food & Groceries)' : 'Food & Groceries'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('seo_desc')}</label>
                <textarea
                  placeholder="Describe your replacement products site for search engine optimization..."
                  value={siteForm.seo_description}
                  onChange={e => setSiteForm(prev => ({ ...prev, seo_description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading h-24 resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">
                  {lang === 'zh' ? '自定义 HTML Header / 站长验证标签 (选填)' : 'Custom HTML Header / Verification Tags (Optional)'}
                </label>
                <textarea
                  placeholder='<meta name="google-site-verification" content="..." />&#10;<meta name="msvalidate.01" content="..." />'
                  value={siteForm.custom_html_tags || ''}
                  onChange={e => setSiteForm(prev => ({ ...prev, custom_html_tags: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono h-20 resize-y"
                />
                <p className="text-[11px] text-text-muted">
                  {lang === 'zh'
                    ? '填入的 <meta> 或 <script> 验证代码将自动植入该独立站所有页面的 <head> 区域（适用于 Google/Bing 站长验证与统计分析）。'
                    : 'HTML code entered here will be injected into the <head> section of all frontend pages.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">
                  {lang === 'zh' ? '图片存储模式 (Cloudflare R2 Storage Mode)' : 'Image R2 Storage Mode'}
                </label>
                <select
                  value={siteForm.r2_storage_mode || 'default_r2'}
                  onChange={e => setSiteForm(prev => ({ ...prev, r2_storage_mode: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                >
                  <option value="default_r2">{lang === 'zh' ? '使用默认 Cloudflare R2 (Master Control Shared R2)' : 'Master Control Shared Cloudflare R2 (Default)'}</option>
                  <option value="child_r2">{lang === 'zh' ? '使用部署网站对应的 Cloudflare R2 (Child Site Dedicated R2)' : 'Child Site Dedicated Cloudflare R2 Bucket'}</option>
                </select>
                <p className="text-[11px] text-text-muted">
                  {lang === 'zh' ? '控制前后台模块自定义上传图片的默认存储位置。' : 'Controls where custom uploaded module images are stored.'}
                </p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="email_forwarding"
                  checked={siteForm.email_forwarding === 1}
                  onChange={e => setSiteForm(prev => ({ ...prev, email_forwarding: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 text-blue-600 border-input-border rounded focus:ring-blue-500 bg-input-bg"
                />
                <label htmlFor="email_forwarding" className="text-sm font-semibold text-text-heading cursor-pointer">
                  {lang === 'zh' ? '启用邮件转发 (info@您的域名 -> 默认转发邮箱)' : 'Enable Email Forwarding (info@yourdomain -> global forwarding email)'}
                </label>
              </div>

              {/* PayPal Settings section */}
              <div className="border-t border-card-border pt-4 mt-2 space-y-4">
                <h4 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
                  <span className="w-2 h-4 rounded bg-blue-600 inline-block"></span>
                  {lang === 'zh' ? 'PayPal 支付对接配置 (选填)' : 'PayPal Payments Config (Optional)'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-semibold uppercase">PayPal Client ID</label>
                    <input
                      type="text"
                      placeholder="PayPal Client ID"
                      value={siteForm.paypal_client_id || ''}
                      onChange={e => setSiteForm(prev => ({ ...prev, paypal_client_id: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-semibold uppercase">PayPal Mode</label>
                    <select
                      value={siteForm.paypal_mode || 'sandbox'}
                      onChange={e => setSiteForm(prev => ({ ...prev, paypal_mode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                    >
                      <option value="sandbox">{lang === 'zh' ? '沙盒测试环境 (Sandbox)' : 'Sandbox (Testing)'}</option>
                      <option value="live">{lang === 'zh' ? '正式生产环境 (Live)' : 'Live (Production)'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">PayPal Client Secret</label>
                  <input
                    type="password"
                    placeholder="PayPal Client Secret"
                    value={siteForm.paypal_client_secret || ''}
                    onChange={e => setSiteForm(prev => ({ ...prev, paypal_client_secret: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('add_config')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / CONFIGURE SITE                            */}
      {/* ======================================================== */}
      {showEditSiteModal && editingSiteForm.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-card-border rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-card-border/60 shrink-0">
              <h3 className="font-bold text-lg text-text-heading">
                {lang === 'zh' ? '修改站点配置' : 'Edit Site Configuration'}
              </h3>
              <button onClick={() => setShowEditSiteModal(false)} className="text-text-muted hover:text-text-heading cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUpdateSite} className="flex-1 overflow-y-auto p-6 space-y-6 admin-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">
                    {lang === 'zh' ? '唯一标识 (不可更改)' : 'Site Identifier (Read-only)'}
                  </label>
                  <input
                    type="text"
                    value={editingSiteForm.name}
                    disabled
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-text-muted cursor-not-allowed opacity-70"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('custom_domain_optional')}</label>
                  <input
                    type="text"
                    placeholder="samsungfilters.com"
                    value={editingSiteForm.domain}
                    onChange={e => setEditingSiteForm(prev => ({ ...prev, domain: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('primary_color')}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editingSiteForm.primary_color}
                      onChange={e => setEditingSiteForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 bg-input-bg border border-input-border rounded-xl p-1 outline-none"
                    />
                    <input
                      type="text"
                      value={editingSiteForm.primary_color}
                      onChange={e => setEditingSiteForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1 px-4 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">{t('accent_color')}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editingSiteForm.accent_color}
                      onChange={e => setEditingSiteForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-12 h-10 bg-input-bg border border-input-border rounded-xl p-1 outline-none"
                    />
                    <input
                      type="text"
                      value={editingSiteForm.accent_color}
                      onChange={e => setEditingSiteForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="flex-1 px-4 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('seo_title')}</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung DA29-00020B Replacement | Pure Filters Store"
                  value={editingSiteForm.seo_title}
                  onChange={e => setEditingSiteForm(prev => ({ ...prev, seo_title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('site_template')}</label>
                <select
                  value={editingSiteForm.template}
                  onChange={e => setEditingSiteForm(prev => ({ ...prev, template: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                  required
                >
                  <option value="apparel">{lang === 'zh' ? '服装美妆 (Apparel & Fashion) - 默认' : 'Apparel & Fashion (Default)'}</option>
                  <option value="home">{lang === 'zh' ? '家居生活 (Home & Living)' : 'Home & Living'}</option>
                  <option value="digital">{lang === 'zh' ? '数码3C (Electronics & Digital)' : 'Electronics & Digital'}</option>
                  <option value="services">{lang === 'zh' ? '软件服务 (Services & Subscriptions)' : 'Services & Subscriptions'}</option>
                  <option value="sports">{lang === 'zh' ? '户外运动 (Sports & Outdoors)' : 'Sports & Outdoors'}</option>
                  <option value="beauty">{lang === 'zh' ? '美妆护肤 (Beauty & Skincare)' : 'Beauty & Skincare'}</option>
                  <option value="baby">{lang === 'zh' ? '母婴玩具 (Mother & Baby)' : 'Mother & Baby'}</option>
                  <option value="auto">{lang === 'zh' ? '汽车配件 (Automotive & Accessories)' : 'Automotive & Accessories'}</option>
                  <option value="jewelry">{lang === 'zh' ? '珠宝手表 (Watches & Jewelry)' : 'Watches & Jewelry'}</option>
                  <option value="food">{lang === 'zh' ? '食品饮料 (Food & Groceries)' : 'Food & Groceries'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">{t('seo_desc')}</label>
                <textarea
                  placeholder="Describe your replacement products site for search engine optimization..."
                  value={editingSiteForm.seo_description}
                  onChange={e => setEditingSiteForm(prev => ({ ...prev, seo_description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading h-24 resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">
                  {lang === 'zh' ? '自定义 HTML Header / 站长验证标签 (选填)' : 'Custom HTML Header / Verification Tags (Optional)'}
                </label>
                <textarea
                  placeholder='<meta name="google-site-verification" content="..." />&#10;<meta name="msvalidate.01" content="..." />'
                  value={editingSiteForm.custom_html_tags || ''}
                  onChange={e => setEditingSiteForm(prev => ({ ...prev, custom_html_tags: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono h-20 resize-y"
                />
                <p className="text-[11px] text-text-muted">
                  {lang === 'zh'
                    ? '填入的 <meta> 或 <script> 验证代码将自动植入该独立站所有页面的 <head> 区域（适用于 Google/Bing 站长验证与统计分析）。'
                    : 'HTML code entered here will be injected into the <head> section of all frontend pages.'}
                </p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="edit_email_forwarding"
                  checked={editingSiteForm.email_forwarding === 1}
                  onChange={e => setEditingSiteForm(prev => ({ ...prev, email_forwarding: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 text-blue-600 border-input-border rounded focus:ring-blue-500 bg-input-bg"
                />
                <label htmlFor="edit_email_forwarding" className="text-sm font-semibold text-text-heading cursor-pointer">
                  {lang === 'zh' ? '启用邮件转发 (info@您的域名 -> 默认转发邮箱)' : 'Enable Email Forwarding (info@yourdomain -> global forwarding email)'}
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase">
                  {lang === 'zh' ? '图片存储模式 (Cloudflare R2 Storage Mode)' : 'Image R2 Storage Mode'}
                </label>
                <select
                  value={editingSiteForm.r2_storage_mode || 'default_r2'}
                  onChange={e => setEditingSiteForm(prev => ({ ...prev, r2_storage_mode: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                >
                  <option value="default_r2">{lang === 'zh' ? '使用默认 Cloudflare R2 (Master Control Shared R2)' : 'Master Control Shared Cloudflare R2 (Default)'}</option>
                  <option value="child_r2">{lang === 'zh' ? '使用部署网站对应的 Cloudflare R2 (Child Site Dedicated R2)' : 'Child Site Dedicated Cloudflare R2 Bucket'}</option>
                </select>
              </div>

              {/* PayPal Settings section */}
              <div className="border-t border-card-border pt-4 mt-2 space-y-4">
                <h4 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
                  <span className="w-2 h-4 rounded bg-blue-600 inline-block"></span>
                  {lang === 'zh' ? 'PayPal 支付对接配置 (选填)' : 'PayPal Payments Config (Optional)'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-semibold uppercase">PayPal Client ID</label>
                    <input
                      type="text"
                      placeholder="PayPal Client ID"
                      value={editingSiteForm.paypal_client_id || ''}
                      onChange={e => setEditingSiteForm(prev => ({ ...prev, paypal_client_id: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted font-semibold uppercase">PayPal Mode</label>
                    <select
                      value={editingSiteForm.paypal_mode || 'sandbox'}
                      onChange={e => setEditingSiteForm(prev => ({ ...prev, paypal_mode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading"
                    >
                      <option value="sandbox">{lang === 'zh' ? '沙盒测试环境 (Sandbox)' : 'Sandbox (Testing)'}</option>
                      <option value="live">{lang === 'zh' ? '正式生产环境 (Live)' : 'Live (Production)'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase">PayPal Client Secret</label>
                  <input
                    type="password"
                    placeholder="PayPal Client Secret"
                    value={editingSiteForm.paypal_client_secret || ''}
                    onChange={e => setEditingSiteForm(prev => ({ ...prev, paypal_client_secret: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-sm text-text-heading font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {lang === 'zh' ? '保存配置修改' : 'Save Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW DEPLOYMENT LOGS WITH POLLED UPDATES          */}
      {/* ======================================================== */}
      {showLogsModal && activeSiteForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-card-border rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h3 className="font-bold text-lg text-text-heading flex items-center gap-2">
                  {t('deploy_logs_title')}
                  {activeSiteForLogs.deploy_status === 'deploying' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  )}
                </h3>
                <p className="text-xs text-text-muted mt-1">{t('domain')}: {activeSiteForLogs.domain || `${activeSiteForLogs.pages_project_name || activeSiteForLogs.name}.pages.dev`}</p>
              </div>
              <button onClick={closeLogs} className="text-text-muted hover:text-text-heading text-lg cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-accent-bg border border-card-border rounded-2xl p-4 font-mono text-xs space-y-3.5 min-h-[300px] max-h-[500px]">
              {deployLogs.length === 0 ? (
                <div className="text-text-muted text-center py-12">{t('no_logs')}</div>
              ) : (
                deployLogs.map((log, index) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-text-muted shrink-0">
                      {mounted ? new Date(log.created_at).toLocaleTimeString() : ''}
                    </span>

                    {/* Step Icon */}
                    <span className="shrink-0 mt-0.5">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : log.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-blue-500/60 border-t-transparent animate-spin inline-block" />
                      )}
                    </span>

                    <div className="flex-1 text-text-heading">
                      <span className="font-semibold text-text-muted capitalize mr-2">[{log.action_type}]:</span>
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-card-border pt-4 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                {activeSiteForLogs.deploy_status === 'deploying' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>{t('realtime_polling')}</span>
                  </>
                ) : (
                  <span>{t('fetched_from_db')}</span>
                )}
              </div>
              <button
                onClick={closeLogs}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-heading rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRODUCT DATABASE MANAGEMENT & AMAZON ASIN IMPORT  */}
      {/* ======================================================== */}
      {showProductsModal && activeSiteForProducts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-card-border rounded-3xl w-full max-w-4xl p-6 space-y-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h3 className="font-bold text-lg text-text-heading flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  {lang === 'zh' ? '独立站商品数据管理' : 'Site Product Data Manager'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {lang === 'zh' ? '域名' : 'Domain'}: {activeSiteForProducts.domain || `${activeSiteForProducts.pages_project_name || activeSiteForProducts.name}.pages.dev`} | D1 UUID: {activeSiteForProducts.d1_database_id ? activeSiteForProducts.d1_database_id.slice(0, 18) + '...' : 'None'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowProductsModal(false);
                  setActiveSiteForProducts(null);
                }} 
                className="text-text-muted hover:text-text-heading text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Top Form: Amazon ASIN Import */}
            <form onSubmit={handleImportProduct} className="bg-accent-bg border border-card-border rounded-2xl p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-bold uppercase block">
                  {lang === 'zh' ? '输入亚马逊商品 ASIN (支持批量)' : 'Amazon Product ASIN(s)'}
                </label>
                <textarea
                  placeholder={lang === 'zh' ? "e.g. B008HD8D7E, B001869T3C\n(支持换行、空格或逗号分隔多个 ASIN)" : "e.g. B008HD8D7E, B001869T3C\n(Supports newline, space or comma separation)"}
                  value={importAsin}
                  onChange={e => setImportAsin(e.target.value)}
                  disabled={importLoading}
                  required
                  className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading font-mono h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-bold uppercase block">
                    {lang === 'zh' ? '国家域名' : 'Domain'}
                  </label>
                  <div className="relative">
                    <select
                      value={importDomain}
                      onChange={e => setImportDomain(e.target.value)}
                      disabled={importLoading}
                      className="w-full pl-3 pr-8 py-2 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading cursor-pointer h-10 appearance-none"
                    >
                      <option value="amazon.com">amazon.com (US)</option>
                      <option value="amazon.co.uk">amazon.co.uk (UK)</option>
                      <option value="amazon.de">amazon.de (DE)</option>
                      <option value="amazon.co.jp">amazon.co.jp (JP)</option>
                      <option value="amazon.ca">amazon.ca (CA)</option>
                      <option value="amazon.fr">amazon.fr (FR)</option>
                      <option value="amazon.it">amazon.it (IT)</option>
                      <option value="amazon.es">amazon.es (ES)</option>
                      <option value="amazon.com.au">amazon.com.au (AU)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-bold uppercase block">
                    {lang === 'zh' ? '抓取语言' : 'Language'}
                  </label>
                  <div className="relative">
                    <select
                      value={importLanguage}
                      onChange={e => setImportLanguage(e.target.value)}
                      disabled={importLoading}
                      className="w-full pl-3 pr-8 py-2 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading cursor-pointer h-10 appearance-none"
                    >
                      <option value="en_US">en_US (English)</option>
                      <option value="zh_CN">zh_CN (中文)</option>
                      <option value="es_US">es_US (Spanish)</option>
                      <option value="de_DE">de_DE (German)</option>
                      <option value="fr_FR">fr_FR (French)</option>
                      <option value="it_IT">it_IT (Italian)</option>
                      <option value="ja_JP">ja_JP (Japanese)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-bold uppercase block">
                    {lang === 'zh' ? '邮编 (选填)' : 'Zip Code (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10001"
                    value={importZipcode}
                    onChange={e => setImportZipcode(e.target.value)}
                    disabled={importLoading}
                    className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading font-mono h-10"
                  />
                </div>

                {['direct', 'local'].includes(sysSettings.amazon_scraper_type) ? (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs text-text-muted font-bold uppercase block">
                      {lang === 'zh' ? '是否可视化' : 'Visualize Process'}
                    </label>
                    <div className="relative">
                      <select
                        value={importVisualize}
                        onChange={e => setImportVisualize(e.target.value)}
                        disabled={importLoading}
                        className="w-full pl-3 pr-8 py-2 bg-input-bg border border-input-border rounded-xl focus:border-blue-500 outline-none text-xs text-text-heading cursor-pointer h-10 appearance-none"
                      >
                        <option value="no">{lang === 'zh' ? '否 (静默无头模式)' : 'No (Silent Headless)'}</option>
                        <option value="yes">{lang === 'zh' ? '是 (弹出浏览器/渲染抓取视图)' : 'Yes (Pop Window/Render View)'}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div className="h-10 hidden md:block" />
                )}
              </div>

              {/* Publish option check */}
              <div className="flex items-center gap-2 pt-1 animate-fade-in select-none">
                <input
                  type="checkbox"
                  id="publishDirectlyCheck"
                  checked={publishDirectly}
                  onChange={e => setPublishDirectly(e.target.checked)}
                  disabled={importLoading}
                  className="w-4 h-4 text-blue-600 bg-input-bg border-input-border rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="publishDirectlyCheck" className="text-xs text-text-heading font-medium cursor-pointer">
                  {lang === 'zh' ? '抓取完成后默认直接上架 (不勾选则保存为草稿)' : 'Publish immediately after scraping (Defaults to Draft if unchecked)'}
                </label>
              </div>

              {/* Crawling Terminal Logs */}
              {(crawlingLogs.length > 0 || importLoading) && (
                <div className="w-full bg-[#0f141c]/95 border border-card-border/85 rounded-2xl p-4 font-mono text-[11px] text-green-400 space-y-1.5 max-h-48 overflow-y-auto animate-fade-in shadow-inner">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider select-none">
                    <span>{lang === 'zh' ? '抓取助手日志终端' : 'Scraper Terminal Logs'}</span>
                    {importLoading && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                        <span>RUNNING</span>
                      </span>
                    )}
                  </div>
                  {crawlingLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed">{log}</div>
                  ))}
                  {importLoading && crawlingLogs.length === 0 && (
                    <div className="text-gray-500 animate-pulse">Initializing scraper connection...</div>
                  )}
                </div>
              )}

              {/* Visualize Live Preview Area */}
              {importVisualize === 'yes' && crawledPreview && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span>{lang === 'zh' ? '可视化抓取实时预览' : 'Live Crawled Preview'}</span>
                  </div>
                  <div className="flex gap-4">
                    {crawledPreview.imageUrl && (
                      <img src={crawledPreview.imageUrl} className="w-16 h-16 rounded-xl object-contain bg-white border border-card-border shrink-0" alt="Preview" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-semibold text-text-heading truncate">{crawledPreview.title}</h4>
                      <p className="text-[10px] text-text-muted">SKU: {crawledPreview.sku} | Brand: {crawledPreview.brand}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-500">${crawledPreview.price}</span>
                        {crawledPreview.comparePrice && (
                          <span className="text-[10px] text-text-muted line-through">${crawledPreview.comparePrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
                <div className="text-xs text-text-muted">
                  {importLoading && importProgress && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      <span>{importProgress}</span>
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10 active:scale-[0.98]"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'zh' ? '正在爬取导入...' : 'Crawling & Importing...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '一键批量抓取商品' : 'Crawl & Import Batch'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Batch Actions Bar */}
            {selectedProductIds.length > 0 && (
              <div className="flex items-center justify-between bg-blue-500/5 border border-blue-500/10 rounded-2xl px-4 py-2.5 text-xs text-text-heading animate-fade-in shrink-0">
                <span className="font-semibold text-blue-500 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  {lang === 'zh' ? `已选择 ${selectedProductIds.length} 个商品` : `Selected ${selectedProductIds.length} products`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBatchStatusProducts(true, undefined)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg shadow-green-600/10"
                  >
                    <span>{lang === 'zh' ? '批量上架' : 'Batch Publish'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchStatusProducts(false, undefined)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg shadow-amber-600/10"
                  >
                    <span>{lang === 'zh' ? '批量下架' : 'Batch Unpublish'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchStatusProducts(undefined, true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg shadow-blue-600/10"
                  >
                    <span>{lang === 'zh' ? '设为首页推荐' : 'Set Featured'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchStatusProducts(undefined, false)}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg shadow-gray-600/10"
                  >
                    <span>{lang === 'zh' ? '取消首页推荐' : 'Remove Featured'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchDeleteProducts}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg shadow-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '批量删除' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Products List Table */}
            <div className="flex-1 overflow-y-auto border border-card-border rounded-2xl min-h-[150px]">
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-xs text-text-muted">{lang === 'zh' ? '正在加载商品列表...' : 'Loading products...'}</span>
                </div>
              ) : siteProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted space-y-2">
                  <Database className="w-10 h-10 opacity-30" />
                  <span className="text-sm font-medium">{lang === 'zh' ? '该站点暂无商品数据' : 'No products found on this site.'}</span>
                  <span className="text-xs text-text-muted">{lang === 'zh' ? '请在上方输入亚马逊 ASIN 抓取上架新商品' : 'Please input an Amazon ASIN to crawl and import.'}</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent-bg border-b border-card-border text-[11px] text-text-muted font-bold uppercase sticky top-0 z-10">
                      <th className="px-4 py-3 w-[45px] text-center">
                        <input
                          type="checkbox"
                          checked={siteProducts.length > 0 && selectedProductIds.length === siteProducts.length}
                          onChange={handleSelectAllProducts}
                          className="w-3.5 h-3.5 rounded border-input-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 w-[70px]">{lang === 'zh' ? '预览' : 'Preview'}</th>
                      <th className="px-4 py-3">{lang === 'zh' ? '商品信息' : 'Product Info'}</th>
                      <th className="px-4 py-3 w-[150px]">{lang === 'zh' ? '品牌/分类' : 'Brand/Category'}</th>
                      <th className="px-4 py-3 w-[90px]">{lang === 'zh' ? '价格' : 'Price'}</th>
                      <th className="px-4 py-3 w-[90px]">{lang === 'zh' ? '状态' : 'Status'}</th>
                      <th className="px-4 py-3 w-[80px] text-center">{lang === 'zh' ? '操作' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-xs text-text-heading">
                    {siteProducts.map((p) => {
                      const productUrl = activeSiteForProducts.domain 
                        ? `https://${activeSiteForProducts.domain}/product/${p.slug}`
                        : `https://${activeSiteForProducts.pages_project_name || activeSiteForProducts.name}.pages.dev/product/${p.slug}`;
                      
                      return (
                        <tr key={p.id} className="hover:bg-slate-500/5 transition-colors animate-fade-in">
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={() => handleSelectProduct(p.id)}
                              className="w-3.5 h-3.5 rounded border-input-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            {p.image_url ? (
                              <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-card-border" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-300 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-text-muted">No Image</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 max-w-[280px]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="font-semibold truncate" title={p.title}>{p.title}</div>
                              {p.is_featured === 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold shrink-0 uppercase tracking-wide">
                                  {lang === 'zh' ? '推荐' : 'Featured'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-text-muted font-mono mt-0.5">SKU: {p.sku || 'None'}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium truncate max-w-[140px]">{p.brand || 'Generic'}</div>
                            <div className="text-[10px] text-text-muted truncate max-w-[140px] mt-0.5">{p.category || 'Apparel'}</div>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-blue-500">
                            ${p.price?.toFixed(2)}
                            {p.compare_price > 0 && (
                              <span className="text-[10px] text-text-muted line-through font-normal block">${p.compare_price?.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => handleToggleProductActive(p.id, p.is_active)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-all hover:opacity-80 active:scale-95 ${
                                p.is_active 
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                  : 'bg-slate-500/10 text-text-muted border border-card-border'
                              }`}
                            >
                              {p.is_active ? (lang === 'zh' ? '已上架' : 'Active') : (lang === 'zh' ? '下架' : 'Draft')}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-text-muted hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                title={lang === 'zh' ? '预览商品页' : 'Preview product page'}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title={lang === 'zh' ? '删除商品' : 'Delete product'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-card-border pt-4">
              <button
                onClick={() => {
                  setShowProductsModal(false);
                  setActiveSiteForProducts(null);
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-heading rounded-xl font-semibold transition-colors cursor-pointer text-xs"
              >
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELECT SITE TO IMPORT SEARCHED ASINS */}
      {showImportToSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-card-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-text-heading">
                {lang === 'zh' ? '选择要导入商品数据的独立站' : 'Select Target Site for Product Import'}
              </h3>
              <button onClick={() => setShowImportToSiteModal(false)} className="text-text-muted hover:text-text-heading cursor-pointer">✕</button>
            </div>
            
            <p className="text-xs text-text-muted">
              {lang === 'zh'
                ? `准备将 ${selectedAsins.length > 0 ? selectedAsins.length : asinSearchResults.length} 个商品的 ASIN 导入到指定的独立站数据库：`
                : `Ready to import ${selectedAsins.length > 0 ? selectedAsins.length : asinSearchResults.length} ASIN(s) into site D1 database:`}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sites.map(site => (
                <button
                  key={site.id}
                  onClick={() => handleOpenImportToSite(site)}
                  className="w-full text-left p-3 border border-card-border hover:border-blue-500 rounded-xl bg-input-bg hover:bg-blue-500/5 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-text-heading">{site.domain || site.name}</div>
                    <div className="text-[10px] text-text-muted">Key: {site.name}</div>
                  </div>
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
