
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'agent');
CREATE TYPE public.agent_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE public.subscription_plan AS ENUM ('trial', 'basic', 'pro');
CREATE TYPE public.lead_source AS ENUM ('whatsapp', 'meta_ads', 'manual', 'referral', 'other');
CREATE TYPE public.lead_status AS ENUM ('new', 'called', 'site_visit_scheduled', 'site_visit_done', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE public.lead_priority AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE public.property_type AS ENUM ('1bhk', '2bhk', '3bhk', 'villa', 'plot', 'commercial');
CREATE TYPE public.budget_range AS ENUM ('under_20l', '20_50l', '50l_1cr', '1cr_plus');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  status public.agent_status NOT NULL DEFAULT 'pending',
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'trial',
  subscription_expires_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  aisensy_api_key TEXT,
  meta_ads_connected BOOLEAN NOT NULL DEFAULT false,
  webhook_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  source public.lead_source NOT NULL DEFAULT 'manual',
  property_interest public.property_type,
  location_preference TEXT,
  budget_range public.budget_range,
  status public.lead_status NOT NULL DEFAULT 'new',
  priority public.lead_priority NOT NULL DEFAULT 'warm',
  notes TEXT,
  lead_source_url TEXT,
  campaign_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reminders
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_at TIMESTAMPTZ NOT NULL,
  note TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Has-role function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New user trigger -> create profile + agent role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'agent');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activity log trigger on lead change
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (lead_id, agent_id, action_type, description)
    VALUES (NEW.id, NEW.agent_id, 'created', 'Lead created from ' || NEW.source);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activities (lead_id, agent_id, action_type, description)
    VALUES (NEW.id, NEW.agent_id, 'status_changed', 'Status: ' || OLD.status || ' → ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lead_activity
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leads policies
CREATE POLICY "Agents view own leads" ON public.leads FOR SELECT USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents update own leads" ON public.leads FOR UPDATE USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents delete own leads" ON public.leads FOR DELETE USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));

-- Reminders policies
CREATE POLICY "Agents manage own reminders" ON public.reminders FOR ALL USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = agent_id);

-- Activities policies
CREATE POLICY "Agents view own activities" ON public.activities FOR SELECT USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- Notifications policies
CREATE POLICY "Agents view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = agent_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;

-- Indexes
CREATE INDEX idx_leads_agent ON public.leads(agent_id, created_at DESC);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_reminders_agent ON public.reminders(agent_id, reminder_at);
CREATE INDEX idx_profiles_webhook ON public.profiles(webhook_token);
