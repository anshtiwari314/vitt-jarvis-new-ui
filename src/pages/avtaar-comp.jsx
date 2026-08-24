<section 
            style={{border:'0.1rem solid red'}}
            className={`data-panel mode-${interactionMode}`}
            aria-label={`${currentNavigation} – ${interactionMode} mode`}
          >
            {/* 1. SOCIAL MODE */}
            {interactionMode === 'social' ? (
              renderSocialStage()
            ) : interactionMode === 'copresent' ? (
              /* 2. CO-PRESENT MODE */
              <div className={`copresent-stage state-${activeAvatarState}`}>
                <aside
                style={{border:'0.2rem solid orange'}}
                  className={`copresent-avatar ${
                    avatarMinimized ? 'avatar-minimized' : ''
                  }`}
                >
                  {avatarMinimized ? (
                    <button
                      type="button"
                      className={`minimized-avatar-dock state-${activeAvatarState}`}
                      onClick={() => setAvatarMinimized(false)}
                      aria-label="Restore AI avatar"
                      title="Restore avatar"
                    >
                      <span>
                        <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
                      </span>
                      <AvatarStateOverlay state={activeAvatarState} />
                      <Maximize2 size={17} />
                    </button>
                  ) : (
                    <div className="copresent-stage-stack">
                      <div className="copresent-avatar-frame">
                        <div
                          className={`copresent-portrait avatar-state-visual state-${activeAvatarState}`}
                        >
                          <button
                            type="button"
                            className="avatar-minimize"
                            onClick={() => setAvatarMinimized(true)}
                            aria-label="Minimize AI avatar"
                            title="Minimize avatar"
                          >
                            <Minimize2 size={17} />
                          </button>
                          <div className="avatar-media-shell">
                            <SectionVideoOverlay>
                              <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
                            </SectionVideoOverlay>
                          </div>
                          <AvatarStateOverlay state={activeAvatarState} />
                        </div>

                        <div className="copresent-live-caption" aria-live="polite">
                          <p>
                            <span className="caption-spoken">
                              We have captured your financial details.{' '}
                            </span>
                            <span className="caption-active">
                              How much of your family's monthly expenses should be protected?
                            </span>
                          </p>
                        </div>
                      </div>

                      <Composer
                        className="copresent-composer"
                        draft={draft}
                        setDraft={setDraft}
                        onSend={handleSendMessage}
                        voiceOn={speakerEnabled}
                        onVoiceToggle={toggleSpeakerPlayback}
                        micOn={manualVadStatus}
                        onMicToggle={() => setManualVadStatus(!manualVadStatus)}
                      />
                    </div>
                  )}
                </aside>

                <section className="copresent-content">
                  <JourneySectionContent {...journeySectionProps} />
                </section>

                <aside className="copresent-mobile-dock" aria-label="AI conversation controls">
                  <div className="mobile-dock-caption">
                    <div className={`mobile-dock-avatar state-${activeAvatarState}`}>
                      <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
                      <AvatarStateOverlay state={activeAvatarState} />
                    </div>
                    <p>
                      <span className="caption-spoken">We have captured your financial details. </span>
                      <span className="caption-active">How much should be protected?</span>
                    </p>
                  </div>
                  <Composer
                    className="copresent-composer"
                    draft={draft}
                    setDraft={setDraft}
                    onSend={handleSendMessage}
                    voiceOn={speakerEnabled}
                    onVoiceToggle={toggleSpeakerPlayback}
                    micOn={manualVadStatus}
                    onMicToggle={() => setManualVadStatus(!manualVadStatus)}
                  />
                </aside>
              </div>
            ) : (
              /* 3. CANVAS MODE — form full width */
              renderCanvasView()
            )}
          </section> 