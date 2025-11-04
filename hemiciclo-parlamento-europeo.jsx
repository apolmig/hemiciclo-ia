import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Flag, Globe2, Loader2, RefreshCw, Users } from 'lucide-react';

const POLITICAL_GROUPS = [
  {
    ref: '7018',
    slug: 'epp',
    shortName: 'EPP',
    longName: "Group of the European People's Party (Christian Democrats)",
    color: '#0054A6'
  },
  {
    ref: '7038',
    slug: 'sd',
    shortName: 'S&D',
    longName: 'Group of the Progressive Alliance of Socialists and Democrats',
    color: '#C1002A'
  },
  {
    ref: '7035',
    slug: 'renew',
    shortName: 'Renew',
    longName: 'Renew Europe Group',
    color: '#F6C700'
  },
  {
    ref: '7037',
    slug: 'ecr',
    shortName: 'ECR',
    longName: 'European Conservatives and Reformists',
    color: '#004A9F'
  },
  {
    ref: '7028',
    slug: 'greens',
    shortName: 'Greens/EFA',
    longName: 'Group of the Greens/European Free Alliance',
    color: '#1A9C3A'
  },
  {
    ref: '7036',
    slug: 'left',
    shortName: 'The Left',
    longName: 'The Left group in the European Parliament - GUE/NGL',
    color: '#A0002D'
  },
  {
    ref: '7150',
    slug: 'pfe',
    shortName: 'Patriots',
    longName: 'Patriots for Europe Group',
    color: '#1F2A73'
  },
  {
    ref: '7151',
    slug: 'esn',
    shortName: 'ESN',
    longName: 'Europe of Sovereign Nations Group',
    color: '#6B2C91'
  },
  {
    ref: '6561',
    slug: 'ni',
    shortName: 'NI',
    longName: 'Non-attached Members',
    color: '#7A7A7A'
  }
];

const VOTE_CHOICES = [
  { key: 'yes', label: 'Si', color: '#16A34A' },
  { key: 'no', label: 'No', color: '#DC2626' },
  { key: 'abstain', label: 'Abstencion', color: '#D97706' },
  { key: 'undecided', label: 'Libre', color: '#4B5563' }
];

const COUNTRY_NAME_TO_CODE = {
  Belgium: 'BE',
  Bulgaria: 'BG',
  Czechia: 'CZ',
  'Czech Republic': 'CZ',
  Denmark: 'DK',
  Germany: 'DE',
  Estonia: 'EE',
  Ireland: 'IE',
  Greece: 'GR',
  Spain: 'ES',
  France: 'FR',
  Croatia: 'HR',
  Italy: 'IT',
  Cyprus: 'CY',
  Latvia: 'LV',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  Hungary: 'HU',
  Malta: 'MT',
  Netherlands: 'NL',
  Austria: 'AT',
  Poland: 'PL',
  Portugal: 'PT',
  Romania: 'RO',
  Slovenia: 'SI',
  Slovakia: 'SK',
  Finland: 'FI',
  Sweden: 'SE'
};

const createVoteCounter = () => ({
  yes: 0,
  no: 0,
  abstain: 0,
  undecided: 0
});

const fetchGroupMembers = async group => {
  const url = `https://www.europarl.europa.eu/meps/en/download/advanced/xml?euPoliticalGroupBodyRefNum=${group.ref}&countryCode=&bodyType=ALL`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/xml,text/xml,*/*;q=0.1'
    }
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo descargar el listado del grupo ${group.shortName} (HTTP ${response.status})`
    );
  }

  const xmlText = await response.text();
  if (typeof window === 'undefined') {
    return [];
  }

  const parser = new window.DOMParser();
  const document = parser.parseFromString(xmlText, 'application/xml');
  const parserErrors = document.getElementsByTagName('parsererror');
  if (parserErrors.length) {
    throw new Error(`Respuesta XML invalida para el grupo ${group.shortName}`);
  }

  const nodes = Array.from(document.getElementsByTagName('mep'));
  return nodes
    .map(node => {
      const lookup = tag =>
        node.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';

      const fullName = lookup('fullName');
      const countryName = lookup('country');
      const nationalParty = lookup('nationalPoliticalGroup');
      const id = lookup('id');

      if (!fullName || !id) {
        return null;
      }

      const normalizedCountry = countryName || 'N/D';
      const countryCode =
        COUNTRY_NAME_TO_CODE[normalizedCountry] ?? normalizedCountry.slice(0, 2).toUpperCase();

      return {
        id,
        fullName,
        countryName: normalizedCountry,
        countryCode,
        nationalParty: nationalParty || 'Independent',
        groupRef: group.ref,
        groupSlug: group.slug
      };
    })
    .filter(Boolean);
};

const VoteButton = ({ active, color, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      cursor: 'pointer',
      borderRadius: '9999px',
      border: active ? 'none' : '1px solid #CBD5F5',
      backgroundColor: active ? color : 'transparent',
      color: active ? '#FFFFFF' : '#1F2937',
      padding: '0.35rem 0.9rem',
      fontWeight: 600,
      fontSize: '0.9rem',
      marginRight: '0.4rem',
      transition: 'all 0.15s ease-in-out'
    }}
  >
    {label}
  </button>
);

const ControlRow = ({ title, subtitle, accent, vote, onVoteChange }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      backgroundColor: '#F5F7FB',
      marginBottom: '0.75rem'
    }}
  >
    <div>
      <div style={{ fontWeight: 700, color: '#111827' }}>{title}</div>
      {subtitle ? (
        <div style={{ color: '#4B5563', fontSize: '0.85rem' }}>{subtitle}</div>
      ) : null}
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {VOTE_CHOICES.map(choice => (
        <VoteButton
          key={choice.key}
          label={choice.label}
          color={choice.key === 'undecided' ? accent ?? '#4B5563' : choice.color}
          active={vote === choice.key}
          onClick={() => onVoteChange(choice.key)}
        />
      ))}
    </div>
  </div>
);

const SummaryBadge = ({ label, value, color }) => (
  <div
    style={{
      background: color,
      color: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '0.8rem 1rem',
      flex: 1,
      minWidth: '130px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem'
    }}
  >
    <span style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>{label}</span>
    <strong style={{ fontSize: '1.4rem', lineHeight: 1 }}>{value}</strong>
  </div>
);

const HemicicloParlamientoEuropeo = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meps, setMeps] = useState([]);
  const [groupVotes, setGroupVotes] = useState({});
  const [countryVotes, setCountryVotes] = useState({});
  const [controlLevel, setControlLevel] = useState('group');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (typeof window === 'undefined') {
          return;
        }

        const results = await Promise.all(
          POLITICAL_GROUPS.map(group => fetchGroupMembers(group))
        );

        const unique = new Map();
        results.forEach(list => {
          list.forEach(mep => {
            if (!unique.has(mep.id)) {
              unique.set(mep.id, mep);
            }
          });
        });

        if (!cancelled) {
          const sorted = Array.from(unique.values()).sort((a, b) =>
            a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          );
          setMeps(sorted);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading && meps.length) {
      setGroupVotes(prev => {
        const next = { ...prev };
        POLITICAL_GROUPS.forEach(group => {
          if (next[group.ref] === undefined) {
            next[group.ref] = 'undecided';
          }
        });
        return next;
      });

      const seenCountries = new Set(meps.map(mep => mep.countryName));
      setCountryVotes(prev => {
        const next = { ...prev };
        seenCountries.forEach(country => {
          if (next[country] === undefined) {
            next[country] = 'undecided';
          }
        });
        return next;
      });
    }
  }, [loading, meps]);

  const uniqueCountries = useMemo(() => {
    const map = new Map();
    meps.forEach(mep => {
      if (!map.has(mep.countryName)) {
        map.set(mep.countryName, {
          name: mep.countryName,
          code: mep.countryCode
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [meps]);

  const finalVotes = useMemo(() => {
    const votes = {};
    meps.forEach(mep => {
      if (controlLevel === 'group') {
        votes[mep.id] = groupVotes[mep.groupRef] ?? 'undecided';
      } else {
        votes[mep.id] = countryVotes[mep.countryName] ?? 'undecided';
      }
    });
    return votes;
  }, [meps, controlLevel, groupVotes, countryVotes]);

  const overallSummary = useMemo(() => {
    const summary = createVoteCounter();
    meps.forEach(mep => {
      const vote = finalVotes[mep.id] ?? 'undecided';
      summary[vote] += 1;
    });
    return summary;
  }, [meps, finalVotes]);

  const aggregateByGroup = useMemo(() => {
    const entries = new Map(
      POLITICAL_GROUPS.map(group => [
        group.ref,
        {
          group,
          counts: createVoteCounter(),
          total: 0
        }
      ])
    );

    meps.forEach(mep => {
      const bucket = entries.get(mep.groupRef);
      if (!bucket) {
        return;
      }
      const vote = finalVotes[mep.id] ?? 'undecided';
      bucket.counts[vote] += 1;
      bucket.total += 1;
    });

    return Array.from(entries.values()).sort((a, b) => b.total - a.total);
  }, [meps, finalVotes]);

  const aggregateByCountry = useMemo(() => {
    const entries = new Map();
    meps.forEach(mep => {
      if (!entries.has(mep.countryName)) {
        entries.set(mep.countryName, {
          name: mep.countryName,
          code: mep.countryCode,
          counts: createVoteCounter(),
          total: 0
        });
      }
      const bucket = entries.get(mep.countryName);
      bucket.total += 1;
      const vote = finalVotes[mep.id] ?? 'undecided';
      bucket.counts[vote] += 1;
    });

    return Array.from(entries.values()).sort((a, b) => b.total - a.total);
  }, [meps, finalVotes]);

  const totalSeats = meps.length;

  const renderControls = () => {
    if (controlLevel === 'group') {
      return POLITICAL_GROUPS.map(group => {
        const groupTotal =
          aggregateByGroup.find(entry => entry.group.ref === group.ref)?.total ?? 0;
        return (
          <ControlRow
            key={group.ref}
            title={`${group.shortName} - ${group.longName}`}
            subtitle={`${groupVotes[group.ref] ?? 'undecided'} - ${groupTotal} escanos`}
            accent={group.color}
            vote={groupVotes[group.ref]}
            onVoteChange={choice =>
              setGroupVotes(prev => ({
                ...prev,
                [group.ref]: choice
              }))
            }
          />
        );
      });
    }

    return uniqueCountries.map(country => {
      const countryTotal =
        aggregateByCountry.find(entry => entry.name === country.name)?.total ?? 0;
      return (
        <ControlRow
          key={country.name}
          title={country.name}
          subtitle={`${countryVotes[country.name] ?? 'undecided'} - ${countryTotal} escanos`}
          accent="#1F2937"
          vote={countryVotes[country.name]}
          onVoteChange={choice =>
            setCountryVotes(prev => ({
              ...prev,
              [country.name]: choice
            }))
          }
        />
      );
    });
  };

  const renderTableHeader = () => (
    <thead>
      <tr
        style={{
          textAlign: 'left',
          backgroundColor: '#111827',
          color: '#FFFFFF'
        }}
      >
        <th style={{ padding: '0.65rem 0.75rem', minWidth: '220px' }}>Bloque</th>
        <th style={{ padding: '0.65rem 0.75rem' }}>Escanos</th>
        <th style={{ padding: '0.65rem 0.75rem' }}>Si</th>
        <th style={{ padding: '0.65rem 0.75rem' }}>No</th>
        <th style={{ padding: '0.65rem 0.75rem' }}>Abstenciones</th>
        <th style={{ padding: '0.65rem 0.75rem' }}>Libre</th>
      </tr>
    </thead>
  );

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={32} color="#2563EB" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', color: '#111827' }}>
              Simulador de votaciones - Parlamento Europeo
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: '#4B5563' }}>
              Controla el voto por grupo politico o por pais y visualiza el resultado agregado en
              tiempo real.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setControlLevel('group')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '9999px',
              border: controlLevel === 'group' ? 'none' : '1px solid #CBD5F5',
              backgroundColor: controlLevel === 'group' ? '#2563EB' : 'transparent',
              color: controlLevel === 'group' ? '#FFFFFF' : '#1F2937',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={18} />
              Control por grupo
            </span>
          </button>
          <button
            type="button"
            onClick={() => setControlLevel('country')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '9999px',
              border: controlLevel === 'country' ? 'none' : '1px solid #CBD5F5',
              backgroundColor: controlLevel === 'country' ? '#2563EB' : 'transparent',
              color: controlLevel === 'country' ? '#FFFFFF' : '#1F2937',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe2 size={18} />
              Control por pais
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const resetGroups = POLITICAL_GROUPS.reduce(
                (acc, group) => ({
                  ...acc,
                  [group.ref]: 'undecided'
                }),
                {}
              );
              const resetCountries = uniqueCountries.reduce(
                (acc, country) => ({
                  ...acc,
                  [country.name]: 'undecided'
                }),
                {}
              );
              setGroupVotes(resetGroups);
              setCountryVotes(resetCountries);
            }}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '9999px',
              border: '1px solid #CBD5F5',
              backgroundColor: 'transparent',
              color: '#1F2937',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={18} />
              Reiniciar
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SummaryBadge label="Total escanos" value={totalSeats} color="#111827" />
          <SummaryBadge label="Si" value={overallSummary.yes} color="#16A34A" />
          <SummaryBadge label="No" value={overallSummary.no} color="#DC2626" />
          <SummaryBadge label="Abstenciones" value={overallSummary.abstain} color="#D97706" />
          <SummaryBadge label="Libre" value={overallSummary.undecided} color="#4B5563" />
        </div>

        {lastUpdated ? (
          <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>
            Datos descargados {lastUpdated.toLocaleString('es-ES')} - Fuente oficial Parlamento
            Europeo (descargas XML por grupo).
          </div>
        ) : null}
      </header>

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '3rem',
            borderRadius: '1rem',
            backgroundColor: '#F3F4F6',
            color: '#111827',
            marginBottom: '2rem'
          }}
        >
          <Loader2 size={22} />
          Cargando datos oficiales...
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            marginBottom: '1.5rem'
          }}
        >
          <AlertCircle size={22} />
          <div>
            <strong>Ha ocurrido un problema al descargar los datos.</strong>
            <div style={{ marginTop: '0.3rem' }}>
              {error.message}. Comprueba la conexion o descarga manualmente los XML desde la
              busqueda avanzada del Parlamento y vuelve a intentarlo.
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.3rem',
                color: '#111827'
              }}
            >
              {controlLevel === 'group' ? <Users size={20} /> : <Flag size={20} />}
              {controlLevel === 'group'
                ? 'Ajusta el voto por grupo politico'
                : 'Ajusta el voto por pais'}
            </h2>
            <div>{renderControls()}</div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.3rem',
                color: '#111827'
              }}
            >
              <CheckCircle2 size={20} />
              Resultado agregado por grupo politico
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                overflow: 'hidden',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                marginBottom: '1.5rem'
              }}
            >
              {renderTableHeader()}
              <tbody>
                {aggregateByGroup.map(entry => (
                  <tr
                    key={entry.group.ref}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#111827'
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>
                        {entry.group.shortName}{' '}
                        <span style={{ color: '#6B7280', fontWeight: 500 }}>
                          ({entry.group.longName})
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{entry.total}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#16A34A' }}>
                      {entry.counts.yes}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#DC2626' }}>
                      {entry.counts.no}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#D97706' }}>
                      {entry.counts.abstain}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#4B5563' }}>
                      {entry.counts.undecided}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.3rem',
                color: '#111827'
              }}
            >
              <Flag size={20} />
              Resultado agregado por pais
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                overflow: 'hidden',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
              }}
            >
              {renderTableHeader()}
              <tbody>
                {aggregateByCountry.map(entry => (
                  <tr
                    key={entry.name}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#111827'
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>
                        {entry.name}{' '}
                        <span style={{ color: '#6B7280', fontWeight: 500 }}>({entry.code})</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{entry.total}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#16A34A' }}>
                      {entry.counts.yes}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#DC2626' }}>
                      {entry.counts.no}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#D97706' }}>
                      {entry.counts.abstain}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#4B5563' }}>
                      {entry.counts.undecided}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default HemicicloParlamientoEuropeo;
