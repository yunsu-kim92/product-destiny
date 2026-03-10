import { useEffect } from 'react';

const DISQUS_SHORTNAME = 'ys-ent-1';

function CommentsSection({ t }) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    window.disqus_config = function disqusConfig() {
      this.page.url = window.location.href;
      this.page.identifier = 'k-destiny-home';
    };

    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });

      return undefined;
    }

    const script = document.createElement('script');
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.disqus_config = undefined;
    };
  }, []);

  return (
    <section className="section" id="comments">
      <div className="section-head">
        <span className="section-kicker">{t('comments.kicker')}</span>
        <h2 className="section-title">{t('comments.title')}</h2>
        <p className="section-subtitle">{t('comments.desc')}</p>
      </div>

      <div className="panel comments-panel">
        <div id="disqus_thread" />
        <noscript>
          {t('comments.noscript.prefix')}{' '}
          <a href="https://disqus.com/?ref_noscript">{t('comments.noscript.link')}</a>
        </noscript>
      </div>
    </section>
  );
}

export default CommentsSection;
